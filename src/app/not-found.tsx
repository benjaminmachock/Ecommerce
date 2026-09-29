import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page center">
      <h1 className="page-title">404</h1>
      <p className="lede">This page unraveled. Let&apos;s stitch you back together.</p>
      <Link href="/shop" className="btn btn-dark">Back to the shop</Link>
    </div>
  );
}
