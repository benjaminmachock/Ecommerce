"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tee } from "@/lib/artwork";
import { formatPrice } from "@/lib/money";
import { startCheckout } from "@/actions/checkout";
import { cart, useCart } from "./cart-store";

export function CartView({ signedIn }: { signedIn: boolean }) {
  const items = useCart();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const subtotal = items.reduce((n, i) => n + i.priceCents * i.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 7500 ? 0 : 599;

  function checkout() {
    if (!signedIn) return router.push("/login?next=/cart");
    setError("");
    start(async () => {
      const res = await startCheckout(items.map(({ productId, size, color, quantity }) => ({ productId, size, color, quantity })));
      if ("error" in res) return setError(res.error);
      window.location.assign(res.url);
    });
  }

  if (items.length === 0) {
    return (
      <div className="empty">
        <svg viewBox="0 0 120 100" width="140" aria-hidden="true"><path className="logo-draw loop" d="M40 10c4 10 36 10 40 0l24 12 8 28-20 8-4-10v46H32V48l-4 10-20-8 8-28L40 10Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" pathLength="1" /></svg>
        <h2>Your cart is empty</h2>
        <p className="muted">Let&apos;s fix that.</p>
        <Link href="/shop" className="btn btn-dark">Browse the shop</Link>
      </div>
    );
  }

  return (
    <div className="cart-grid">
      <ul className="cart-list">
        {items.map((i) => (
          <li key={`${i.productId}-${i.color}-${i.size}`} className="cart-line">
            <div className="line-media"><Tee artwork={i.artwork} color={i.color} label={i.name} /></div>
            <div className="line-info">
              <Link href={`/product/${i.slug}`}><b>{i.name}</b></Link>
              <span className="muted">{i.color} / {i.size}</span>
              <div className="qty small" role="group" aria-label={`Quantity for ${i.name}`}>
                <button onClick={() => cart.setQuantity(i, i.quantity - 1)} aria-label="Decrease">−</button>
                <output>{i.quantity}</output>
                <button onClick={() => cart.setQuantity(i, i.quantity + 1)} aria-label="Increase">+</button>
              </div>
            </div>
            <p className="price">{formatPrice(i.priceCents * i.quantity)}</p>
          </li>
        ))}
      </ul>
      <aside className="summary">
        <h2>Order summary</h2>
        <dl>
          <div><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
          <div><dt>Shipping</dt><dd>{shipping ? formatPrice(shipping) : "Free"}</dd></div>
          <div className="total"><dt>Total</dt><dd>{formatPrice(subtotal + shipping)}</dd></div>
        </dl>
        {subtotal < 7500 && <p className="muted small">Add {formatPrice(7500 - subtotal)} more for free shipping.</p>}
        <button className="btn btn-accent block" onClick={checkout} disabled={pending}>
          {pending ? "Redirecting…" : signedIn ? "Checkout" : "Sign in to checkout"}
        </button>
        <p className="form-error" role="alert">{error}</p>
      </aside>
    </div>
  );
}
