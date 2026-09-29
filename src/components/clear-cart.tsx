"use client";

import { useEffect } from "react";
import { cart } from "./cart-store";

export function ClearCart({ active }: { active: boolean }) {
  useEffect(() => {
    if (active) cart.clear();
  }, [active]);
  return null;
}
