import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logout } from "@/actions/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";

export const metadata: Metadata = { title: "Your account" };

export default async function Account() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/account");
  // Always scoped to the signed-in user's id.
  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });
  return (
    <div className="wrap page">
      <h1 className="page-title">Hi, {session.user.name?.split(" ")[0]}</h1>
      <p className="lede">{session.user.email}</p>
      <form action={logout}><button className="btn btn-ghost">Sign out</button></form>
      <h2>Order history</h2>
      {orders.length === 0 ? <p className="muted">No orders yet.</p> : (
        <ul className="orders">
          {orders.map((o) => (
            <li key={o.id} className="order">
              <div className="order-head">
                <b>#{o.id.slice(-8).toUpperCase()}</b>
                <span className="pill" data-status={o.status}>{o.status}</span>
                <span className="muted">{o.createdAt.toLocaleDateString("en-US")}</span>
                <b className="push">{formatPrice(o.totalCents)}</b>
              </div>
              <ul>{o.items.map((i) => <li key={i.id}>{i.quantity} × {i.product.name} — {i.color} / {i.size}</li>)}</ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
