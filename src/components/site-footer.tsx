import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <Logo />
          <p className="muted">Soft shirts with a sense of humor. Designed in small batches, printed with water-based inks.</p>
        </div>
        <nav aria-label="Shop">
          <h2>Shop</h2>
          <Link href="/shop">All tees</Link>
          <Link href="/shop?category=Graphic">Graphic</Link>
          <Link href="/shop?category=Essentials">Essentials</Link>
          <Link href="/shop?category=Limited">Limited drops</Link>
        </nav>
        <nav aria-label="Account">
          <h2>Account</h2>
          <Link href="/login">Sign in</Link>
          <Link href="/register">Create account</Link>
          <Link href="/cart">Cart</Link>
        </nav>
        <div>
          <h2>Good to know</h2>
          <p className="muted">Free shipping over $75. Easy 30-day returns. Sizes XS to XXL.</p>
        </div>
      </div>
      <p className="wrap legal">© {new Date().getFullYear()} Threadline. A demo store built for fun. No real orders are fulfilled.</p>
    </footer>
  );
}
