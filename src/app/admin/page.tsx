import Link from "next/link";
import { db } from "@/lib/db";
import { Tee } from "@/lib/artwork";
import { formatPrice } from "@/lib/money";
import { deleteProduct, toggleProduct } from "@/actions/admin";

export default async function AdminProducts() {
  const [products, paid, orderCount] = await Promise.all([
    db.product.findMany({ orderBy: [{ active: "desc" }, { createdAt: "desc" }] }),
    db.order.aggregate({ where: { status: "PAID" }, _sum: { totalCents: true }, _count: true }),
    db.order.count(),
  ]);
  const live = products.filter((p) => p.active).length;

  return (
    <>
      <h1 className="page-title">Products</h1>
      <dl className="stats">
        <div><dt>Live products</dt><dd>{live}</dd></div>
        <div><dt>Archived</dt><dd>{products.length - live}</dd></div>
        <div><dt>Orders</dt><dd>{orderCount}</dd></div>
        <div><dt>Paid revenue</dt><dd>{formatPrice(paid._sum.totalCents ?? 0)}</dd></div>
      </dl>
      <p><Link href="/admin/products/new" className="btn btn-accent">+ New product</Link></p>

      <ul className="admin-list">
        {products.map((p) => (
          <li key={p.id} className="admin-row" data-archived={!p.active}>
            <div className="admin-thumb"><Tee artwork={p.artwork} color={p.colors[0]} label="" /></div>
            <div className="admin-main">
              <Link href={`/admin/products/${p.id}`}><b>{p.name}</b></Link>
              <span className="muted">{p.category} · {formatPrice(p.priceCents)} · {p.colors.length} colors</span>
              <span className="tags">
                {!p.active && <span className="pill">ARCHIVED</span>}
                {p.featured && <span className="pill" data-status="PAID">FEATURED</span>}
              </span>
            </div>
            <div className="admin-actions">
              <Link href={`/admin/products/${p.id}`} className="btn btn-ghost sm">Edit</Link>
              <form action={toggleProduct}>
                <input type="hidden" name="id" value={p.id} /><input type="hidden" name="field" value="featured" />
                <button className="btn btn-ghost sm">{p.featured ? "Unfeature" : "Feature"}</button>
              </form>
              <form action={toggleProduct}>
                <input type="hidden" name="id" value={p.id} /><input type="hidden" name="field" value="active" />
                <button className="btn btn-ghost sm">{p.active ? "Archive" : "Restore"}</button>
              </form>
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={p.id} />
                <button className="btn btn-ghost sm danger">Delete</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
