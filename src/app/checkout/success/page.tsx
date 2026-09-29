import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ClearCart } from "@/components/clear-cart";

export const metadata: Metadata = { title: "Order confirmed" };

export default async function Success({ searchParams }: { searchParams: Promise<{ order?: string; demo?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { order: id, demo } = await searchParams;
  const order = id ? await db.order.findFirst({ where: { id, userId: session.user.id } }) : null;
  if (!order) redirect("/account");
  const paid = order.status === "PAID";
  return (
    <div className="wrap page center success">
      <ClearCart active={paid} />
      <svg viewBox="0 0 120 120" width="120" aria-hidden="true">
        <circle className="logo-draw" cx="60" cy="60" r="52" fill="none" stroke="var(--accent)" strokeWidth="6" pathLength="1" />
        <path className="check-draw" d="M36 62l16 16 32-34" fill="none" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
      </svg>
      <h1 className="page-title">{paid ? "Thank you!" : "Payment processing"}</h1>
      <p className="lede">
        {paid ? <>Order #{order.id.slice(-8).toUpperCase()} is confirmed.</> : <>We&apos;re waiting on payment confirmation for order #{order.id.slice(-8).toUpperCase()}. Refresh in a moment.</>}
      </p>
      {demo && <p className="muted">Demo mode: no Stripe keys are configured, so no payment was taken.</p>}
      <Link href="/account" className="btn btn-dark">View orders</Link>
    </div>
  );
}
