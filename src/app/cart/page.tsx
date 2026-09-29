import type { Metadata } from "next";
import { auth } from "@/auth";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = { title: "Your cart" };

export default async function CartPage() {
  const session = await auth();
  return (
    <div className="wrap page">
      <h1 className="page-title">Your cart</h1>
      <CartView signedIn={!!session?.user} />
    </div>
  );
}
