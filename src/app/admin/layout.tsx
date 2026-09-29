import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="wrap page admin">
      <nav className="admin-bar" aria-label="Admin">
        <b>Admin</b>
        <Link href="/admin">Products</Link>
        <Link href="/admin/orders">Orders</Link>
        <Link href="/admin/products/new">New product</Link>
        <Link href="/" className="push">View store →</Link>
      </nav>
      {children}
    </div>
  );
}
