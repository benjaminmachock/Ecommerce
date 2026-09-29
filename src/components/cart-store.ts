"use client";

import { useSyncExternalStore } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  artwork: string;
  color: string;
  size: string;
  quantity: number;
  priceCents: number; // display only; the server re-prices at checkout
};

const KEY = "threadline-cart";
const listeners = new Set<() => void>();
const EMPTY: CartItem[] = [];
let cachedRaw: string | null = null;
let cached: CartItem[] = EMPTY;

function read(): CartItem[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    const data = raw ? JSON.parse(raw) : [];
    cached = Array.isArray(data) ? data : EMPTY;
  } catch {
    cached = EMPTY;
  }
  return cached;
}

function write(items: CartItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
  listeners.forEach((l) => l());
}

const same = (a: CartItem, b: Pick<CartItem, "productId" | "size" | "color">) =>
  a.productId === b.productId && a.size === b.size && a.color === b.color;

export const cart = {
  add(item: CartItem) {
    const items = [...read()];
    const i = items.findIndex((x) => same(x, item));
    if (i >= 0) items[i] = { ...items[i], quantity: Math.min(10, items[i].quantity + item.quantity) };
    else items.push(item);
    write(items);
  },
  setQuantity(target: CartItem, quantity: number) {
    write(read().flatMap((x) => (same(x, target) ? (quantity > 0 ? [{ ...x, quantity: Math.min(10, quantity) }] : []) : [x])));
  },
  clear() {
    write([]);
  },
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export const useCart = () => useSyncExternalStore(subscribe, read, () => EMPTY);
