import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/order-email";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!stripe || !secret || !signature) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  let event;
  try {
    // Signature is verified against the raw body; never parse JSON first.
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    if (s.payment_status === "paid") {
      const ship = s.collected_information?.shipping_details;
      const clip = (v: string | null | undefined, n = 200) => v?.slice(0, n) || null;
      // Address is saved even if the order was already marked paid (e.g. a webhook retry).
      if (ship) {
        await db.order.updateMany({
          where: { stripeSessionId: s.id },
          data: {
            shipName: clip(ship.name),
            shipLine1: clip(ship.address.line1),
            shipLine2: clip(ship.address.line2),
            shipCity: clip(ship.address.city, 100),
            shipState: clip(ship.address.state, 100),
            shipPostalCode: clip(ship.address.postal_code, 20),
            shipCountry: clip(ship.address.country, 2),
          },
        });
      }
      await db.order.updateMany({
        where: { stripeSessionId: s.id, status: "PENDING" },
        data: { status: "PAID" },
      });
      // Runs for retries too; it is a no-op once the email has gone out.
      const order = await db.order.findUnique({ where: { stripeSessionId: s.id }, select: { id: true } });
      if (order) await sendOrderConfirmation(order.id);
    }
  }
  return NextResponse.json({ received: true });
}
