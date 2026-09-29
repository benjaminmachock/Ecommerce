"use client";

import { useCart } from "./cart-store";

export function CartCount() {
  const count = useCart().reduce((n, i) => n + i.quantity, 0);
  return (
    <span className="cart-count" data-empty={count === 0} aria-label={`${count} items in cart`}>
      {count}
    </span>
  );
}
