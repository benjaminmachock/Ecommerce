import { db } from "@/lib/db";
import { sendMail } from "@/lib/email";
import { formatPrice } from "@/lib/money";
import { orderRef } from "@/lib/orders";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Emails the customer once per order. The confirmationSentAt claim is an atomic
 * compare-and-set, so concurrent or retried webhooks can't double-send. If sending
 * fails the claim is released so a later retry can try again.
 */
export async function sendOrderConfirmation(orderId: string) {
  const claim = await db.order.updateMany({
    where: { id: orderId, status: "PAID", confirmationSentAt: null },
    data: { confirmationSentAt: new Date() },
  });
  if (claim.count === 0) return;

  try {
    const order = await db.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { user: { select: { name: true, email: true } }, items: { include: { product: true } } },
    });
    const origin = process.env.AUTH_URL ?? "http://localhost:3000";
    const ref = orderRef(order.id);
    const address = order.shipLine1
      ? [order.shipName, order.shipLine1, order.shipLine2, `${order.shipCity}, ${order.shipState} ${order.shipPostalCode}`, order.shipCountry].filter(Boolean) as string[]
      : [];
    const lines = order.items.map((i) => ({
      label: `${i.quantity} × ${i.product.name} (${i.color} / ${i.size})`,
      price: formatPrice(i.unitPriceCents * i.quantity),
    }));

    const text = [
      `Hi ${order.user.name},`,
      "",
      `Thanks for your order ${ref}! We're getting it ready.`,
      "",
      ...lines.map((l) => `${l.label} — ${l.price}`),
      `Total: ${formatPrice(order.totalCents)}`,
      ...(address.length ? ["", "Shipping to:", ...address] : []),
      "",
      `View your orders: ${origin}/account`,
    ].join("\n");

    const html = `<div style="font-family:system-ui,sans-serif;max-width:32rem;margin:auto;color:#1b1b1f">
  <h1 style="font-size:1.6rem;margin:0 0 .5rem">Thanks for your order!</h1>
  <p>Hi ${esc(order.user.name)}, order <b>${esc(ref)}</b> is confirmed and we're getting it ready.</p>
  <table style="width:100%;border-collapse:collapse;margin:1rem 0">
    ${lines.map((l) => `<tr><td style="padding:.5rem 0;border-bottom:1px solid #e4dccb">${esc(l.label)}</td><td style="padding:.5rem 0;border-bottom:1px solid #e4dccb;text-align:right">${esc(l.price)}</td></tr>`).join("")}
    <tr><td style="padding:.75rem 0"><b>Total</b></td><td style="padding:.75rem 0;text-align:right"><b>${esc(formatPrice(order.totalCents))}</b></td></tr>
  </table>
  ${address.length ? `<p style="margin:0"><b>Shipping to</b><br>${address.map(esc).join("<br>")}</p>` : ""}
  <p><a href="${esc(origin)}/account" style="display:inline-block;background:#1b1b1f;color:#fff;padding:.7rem 1.4rem;border-radius:99px;text-decoration:none;font-weight:700">View your orders</a></p>
</div>`;

    await sendMail({ to: order.user.email, subject: `Order ${ref} confirmed`, text, html });
  } catch (err) {
    await db.order.updateMany({ where: { id: orderId }, data: { confirmationSentAt: null } });
    console.error("Failed to send order confirmation", orderId, err);
  }
}
