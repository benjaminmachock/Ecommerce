import { db } from "@/lib/db";
import { sendMail } from "@/lib/email";
import { formatPrice } from "@/lib/money";
import { siteUrl } from "@/lib/site-url";
import { orderRef } from "@/lib/orders";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const loadOrder = (id: string) =>
  db.order.findUniqueOrThrow({
    where: { id },
    include: { user: { select: { name: true, email: true } }, items: { include: { product: true } } },
  });
type LoadedOrder = Awaited<ReturnType<typeof loadOrder>>;

const addressLines = (o: LoadedOrder): string[] =>
  o.shipLine1
    ? ([o.shipName, o.shipLine1, o.shipLine2, `${o.shipCity}, ${o.shipState} ${o.shipPostalCode}`, o.shipCountry].filter(Boolean) as string[])
    : [];

const itemLines = (o: LoadedOrder) =>
  o.items.map((i) => ({
    label: `${i.quantity} × ${i.product.name} (${i.color} / ${i.size})`,
    price: formatPrice(i.unitPriceCents * i.quantity),
  }));

const itemsTable = (lines: { label: string; price: string }[]) =>
  lines.map((l) => `<tr><td style="padding:.5rem 0;border-bottom:1px solid #e4dccb">${esc(l.label)}</td><td style="padding:.5rem 0;border-bottom:1px solid #e4dccb;text-align:right">${esc(l.price)}</td></tr>`).join("");

const shell = (body: string) =>
  `<div style="font-family:system-ui,sans-serif;max-width:32rem;margin:auto;color:#1b1b1f">${body}</div>`;

const button = (href: string, label: string) =>
  `<p><a href="${esc(href)}" style="display:inline-block;background:#1b1b1f;color:#fff;padding:.7rem 1.4rem;border-radius:99px;text-decoration:none;font-weight:700">${esc(label)}</a></p>`;

/**
 * Both emails follow the same pattern: an atomic compare-and-set on a "sent at"
 * column claims the send, so retries and double clicks can't send twice. If sending
 * fails the claim is released so a later attempt can try again.
 */
async function sendOnce(
  orderId: string,
  claim: { where: Record<string, unknown>; column: "confirmationSentAt" | "shippedEmailSentAt" },
  build: (o: LoadedOrder) => { subject: string; text: string; html: string },
) {
  const claimed = await db.order.updateMany({
    where: { id: orderId, [claim.column]: null, ...claim.where },
    data: { [claim.column]: new Date() },
  });
  if (claimed.count === 0) return;

  try {
    const order = await loadOrder(orderId);
    await sendMail({ to: order.user.email, ...build(order) });
  } catch (err) {
    await db.order.updateMany({ where: { id: orderId }, data: { [claim.column]: null } });
    console.error(`Failed to send ${claim.column} email`, orderId, err);
  }
}

/** Sent when an order becomes paid. */
export const sendOrderConfirmation = (orderId: string) =>
  sendOnce(orderId, { where: { status: "PAID" }, column: "confirmationSentAt" }, (order) => {
    const origin = siteUrl();
    const ref = orderRef(order.id);
    const address = addressLines(order);
    const lines = itemLines(order);

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

    const html = shell(`
  <h1 style="font-size:1.6rem;margin:0 0 .5rem">Thanks for your order!</h1>
  <p>Hi ${esc(order.user.name)}, order <b>${esc(ref)}</b> is confirmed and we're getting it ready.</p>
  <table style="width:100%;border-collapse:collapse;margin:1rem 0">
    ${itemsTable(lines)}
    <tr><td style="padding:.75rem 0"><b>Total</b></td><td style="padding:.75rem 0;text-align:right"><b>${esc(formatPrice(order.totalCents))}</b></td></tr>
  </table>
  ${address.length ? `<p style="margin:0"><b>Shipping to</b><br>${address.map(esc).join("<br>")}</p>` : ""}
  ${button(`${origin}/account`, "View your orders")}`);

    return { subject: `Order ${ref} confirmed`, text, html };
  });

/** Sent when an admin marks an order shipped. Includes the tracking number if one was entered. */
export const sendShippedEmail = (orderId: string) =>
  sendOnce(orderId, { where: { status: "SHIPPED" }, column: "shippedEmailSentAt" }, (order) => {
    const origin = siteUrl();
    const ref = orderRef(order.id);
    const address = addressLines(order);
    const lines = itemLines(order);

    const text = [
      `Hi ${order.user.name},`,
      "",
      `Good news! Your order ${ref} has shipped.`,
      ...(order.trackingNumber ? ["", `Tracking number: ${order.trackingNumber}`] : []),
      "",
      ...lines.map((l) => `${l.label}`),
      ...(address.length ? ["", "Shipping to:", ...address] : []),
      "",
      `View your orders: ${origin}/account`,
    ].join("\n");

    const html = shell(`
  <h1 style="font-size:1.6rem;margin:0 0 .5rem">Your order has shipped!</h1>
  <p>Hi ${esc(order.user.name)}, order <b>${esc(ref)}</b> is on its way.</p>
  ${order.trackingNumber ? `<p style="background:#f3ecdc;padding:.8rem 1rem;border-radius:.75rem;margin:1rem 0"><b>Tracking number</b><br><span style="font-size:1.15rem;letter-spacing:.03em">${esc(order.trackingNumber)}</span></p>` : ""}
  <table style="width:100%;border-collapse:collapse;margin:1rem 0">${itemsTable(lines.map((l) => ({ label: l.label, price: "" })))}</table>
  ${address.length ? `<p style="margin:0"><b>Shipping to</b><br>${address.map(esc).join("<br>")}</p>` : ""}
  ${button(`${origin}/account`, "View your orders")}`);

    return { subject: `Order ${ref} has shipped`, text, html };
  });
