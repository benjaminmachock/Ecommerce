import { NextResponse } from "next/server";
import { db } from "@/lib/db";
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
      await db.order.updateMany({
        where: { stripeSessionId: s.id, status: "PENDING" },
        data: { status: "PAID" },
      });
    }
  }
  return NextResponse.json({ received: true });
}
