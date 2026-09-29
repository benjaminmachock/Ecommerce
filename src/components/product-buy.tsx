"use client";

import { useState } from "react";
import Link from "next/link";
import { COLORS, Tee } from "@/lib/artwork";
import { formatPrice } from "@/lib/money";
import { cart } from "./cart-store";

type P = { id: string; slug: string; name: string; artwork: string; priceCents: number; colors: string[]; sizes: string[] };

export function ProductBuy({ p }: { p: P }) {
  const [color, setColor] = useState(p.colors[0]);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  function add() {
    if (!size) return setError("Pick a size first.");
    setError("");
    cart.add({ productId: p.id, slug: p.slug, name: p.name, artwork: p.artwork, color, size, quantity: qty, priceCents: p.priceCents });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="pdp">
      <div className="pdp-media" style={{ "--tone": COLORS[color] } as React.CSSProperties}>
        <Tee artwork={p.artwork} color={color} className="pdp-tee" label={`${p.name} in ${color}`} />
      </div>
      <div className="pdp-info">
        <p className="price big">{formatPrice(p.priceCents)}</p>

        <fieldset className="opt">
          <legend>Color: <b>{color}</b></legend>
          <div className="opt-row">
            {p.colors.map((c) => (
              <label key={c} className="swatch" title={c}>
                <input type="radio" name="color" value={c} checked={color === c} onChange={() => setColor(c)} />
                <span style={{ background: COLORS[c] }} />
                <span className="sr-only">{c}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="opt">
          <legend>Size</legend>
          <div className="opt-row">
            {p.sizes.map((s) => (
              <label key={s} className="size">
                <input type="radio" name="size" value={s} checked={size === s} onChange={() => { setSize(s); setError(""); }} />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="buy-row">
          <div className="qty" role="group" aria-label="Quantity">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
            <output>{qty}</output>
            <button type="button" onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="Increase">+</button>
          </div>
          <button type="button" className="btn btn-accent grow" onClick={add}>Add to cart</button>
        </div>
        <p className="form-error" role="alert">{error}</p>
        {added && (
          <p className="added" role="status">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" /><path className="check-draw" d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" pathLength="1" /></svg>
            Added to your cart. <Link href="/cart">View cart</Link>
          </p>
        )}
      </div>
    </div>
  );
}
