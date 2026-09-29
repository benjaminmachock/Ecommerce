import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { STATUSES, orderRef } from "@/lib/orders";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = STATUSES.find((s) => s === status);
  const [orders, counts] = await Promise.all([
    db.order.findMany({
      where: filter ? { status: filter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { name: true, email: true } }, _count: { select: { items: true } } },
    }),
    db.order.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <>
      <h1 className="page-title">Orders</h1>
      <nav className="chips" aria-label="Filter by status">
        <Link href="/admin/orders" aria-current={!filter}>All ({counts.reduce((n, c) => n + c._count, 0)})</Link>
        {STATUSES.map((s) => <Link key={s} href={`/admin/orders?status=${s}`} aria-current={filter === s}>{s} ({count(s)})</Link>)}
      </nav>
      {orders.length === 0 ? <p className="muted" style={{ marginTop: "1.5rem" }}>No orders here yet.</p> : (
        <ul className="admin-list">
          {orders.map((o) => (
            <li key={o.id} className="order-row">
              <Link href={`/admin/orders/${o.id}`}><b>{orderRef(o.id)}</b></Link>
              <span className="pill" data-status={o.status}>{o.status}</span>
              <span className="muted">{o.user.name} · {o.user.email}</span>
              <span className="muted">{o._count.items} {o._count.items === 1 ? "line" : "lines"} · {o.createdAt.toLocaleDateString("en-US")}</span>
              <b className="push">{formatPrice(o.totalCents)}</b>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
