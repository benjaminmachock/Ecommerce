"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/order-email";
import { rateLimit } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/site-url";
import { stripe } from "@/lib/stripe";
import { cartSchema } from "@/lib/validation";

export type CheckoutResult = { error: string } | { url: string };

/**
 * Prices are always re-read from the database; the client only sends
 * product ids, options and quantities, never amounts.
 */
export async function startCheckout(rawCart: unknown): Promise<CheckoutResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in to check out." };
  if (!(await rateLimit(`checkout:${session.user.id}`, 10, 10 * 60))) {
    return { error: "Too many attempts. Please wait a few minutes." };
  }

  const parsed = cartSchema.safeParse(rawCart);
  if (!parsed.success) return { error: "Your cart looks invalid." };

  const products = await db.product.findMany({ where: { id: { in: parsed.data.map((i) => i.productId) } } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines = [];
  for (const item of parsed.data) {
    const p = byId.get(item.productId);
    if (!p || !p.active || !p.sizes.includes(item.size) || !p.colors.includes(item.color)) {
      return { error: "An item in your cart is no longer available." };
    }
    lines.push({ ...item, product: p });
  }
  const totalCents = lines.reduce((sum, l) => sum + l.product.priceCents * l.quantity, 0);

  const order = await db.order.create({
    data: {
      userId: session.user.id,
      totalCents,
      items: {
        create: lines.map((l) => ({
          productId: l.productId,
          size: l.size,
          color: l.color,
          quantity: l.quantity,
          unitPriceCents: l.product.priceCents,
        })),
      },
    },
  });

  const origin = siteUrl();

  if (!stripe) {
    // Demo mode: no Stripe keys configured, so mark paid immediately.
    await db.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    await sendOrderConfirmation(order.id);
    return { url: `${origin}/checkout/success?order=${order.id}&demo=1` };
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: order.id,
    customer_email: session.user.email ?? undefined,
    shipping_address_collection: { allowed_countries: ["US", "CA"] },
    line_items: lines.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency: "usd",
        unit_amount: l.product.priceCents,
        product_data: { name: `${l.product.name} — ${l.color} / ${l.size}` },
      },
    })),
    success_url: `${origin}/checkout/success?order=${order.id}`,
    cancel_url: `${origin}/cart`,
  });
  await db.order.update({ where: { id: order.id }, data: { stripeSessionId: checkout.id } });
  if (!checkout.url) return { error: "Could not start payment." };
  return { url: checkout.url };
}

export async function goToLogin() {
  redirect("/login?next=/cart");
}
