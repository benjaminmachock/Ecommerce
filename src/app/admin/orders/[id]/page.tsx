import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Tee } from "@/lib/artwork";
import { formatPrice } from "@/lib/money";
import { orderRef } from "@/lib/orders";
import { OrderStatusForm } from "@/components/order-status-form";

export const metadata: Metadata = { title: "Order" };

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } }, items: { include: { product: true } } },
  });
  if (!order) notFound();

  return (
    <>
      <p className="crumbs"><Link href="/admin/orders">Orders</Link> / {orderRef(order.id)}</p>
      <h1 className="page-title">Order {orderRef(order.id)}</h1>
      <div className="order-detail">
        <section>
          <ul className="cart-list">
            {order.items.map((i) => (
              <li key={i.id} className="cart-line">
                <div className="line-media"><Tee artwork={i.product.artwork} color={i.color} label="" /></div>
                <div className="line-info"><b>{i.product.name}</b><span className="muted">{i.color} / {i.size} · qty {i.quantity}</span></div>
                <p className="price">{formatPrice(i.unitPriceCents * i.quantity)}</p>
              </li>
            ))}
          </ul>
          <p className="order-total"><span>Total</span><b>{formatPrice(order.totalCents)}</b></p>
        </section>
        <aside className="summary">
          <h2>Customer</h2>
          <p><b>{order.user.name}</b><br /><span className="muted">{order.user.email}</span></p>
          <p className="muted small">Placed {order.createdAt.toLocaleString("en-US")}{order.shippedAt && <><br />Shipped {order.shippedAt.toLocaleString("en-US")}</>}</p>
          {order.stripeSessionId && <p className="muted small">Stripe session: {order.stripeSessionId.slice(0, 18)}…</p>}
          <h2>Ship to</h2>
          {order.shipLine1 ? (
            <address className="ship">
              <b>{order.shipName}</b><br />
              {order.shipLine1}<br />
              {order.shipLine2 && <>{order.shipLine2}<br /></>}
              {order.shipCity}, {order.shipState} {order.shipPostalCode}<br />
              {order.shipCountry}
            </address>
          ) : (
            <p className="muted small">No address on file (demo-mode orders skip Stripe).</p>
          )}
          <h2>Fulfillment</h2>
          <OrderStatusForm id={order.id} status={order.status} trackingNumber={order.trackingNumber ?? ""} />
        </aside>
      </div>
    </>
  );
}
