import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logout } from "@/actions/auth";
import { CartCount } from "./cart-count";
import { Logo } from "./logo";

const NAV = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?category=Graphic", label: "Graphic" },
  { href: "/shop?category=Vintage", label: "Vintage" },
  { href: "/shop?category=Essentials", label: "Essentials" },
  { href: "/shop?category=Limited", label: "Limited" },
];

export async function SiteHeader() {
  const session = await auth();
  const isAdmin = session?.user?.id ? (await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } }))?.role === "ADMIN" : false;
  return (
    <>
      <p className="promo">Free shipping over $75 · 30-day returns · Organic cotton</p>
      <header className="site-header">
        <div className="wrap header-row">
          <button className="menu-btn" popoverTarget="mobile-nav" aria-label="Open menu">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <Link href="/" className="logo-link" aria-label="Threadline home"><Logo /></Link>
          <nav className="nav-desktop" aria-label="Main">
            {NAV.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
          </nav>
          <div className="header-actions">
            {isAdmin && <Link href="/admin" className="text-link">Admin</Link>}
            {session?.user ? (
              <Link href="/account" className="text-link">Account</Link>
            ) : (
              <Link href="/login" className="text-link">Sign in</Link>
            )}
            <Link href="/cart" className="cart-link" aria-label="Cart">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Zm3 0a3 3 0 0 1 6 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /></svg>
              <CartCount />
            </Link>
          </div>
        </div>
        <nav id="mobile-nav" popover="auto" className="mobile-nav" aria-label="Mobile">
          <button popoverTarget="mobile-nav" popoverTargetAction="hide" className="menu-close" aria-label="Close menu">✕</button>
          {NAV.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
          <hr />
          {session?.user ? (
            <>
              <Link href="/account">Account</Link>
              {isAdmin && <Link href="/admin">Admin</Link>}
              <form action={logout}><button type="submit">Sign out</button></form>
            </>
          ) : (
            <>
              <Link href="/login">Sign in</Link>
              <Link href="/register">Create account</Link>
            </>
          )}
        </nav>
      </header>
    </>
  );
}
