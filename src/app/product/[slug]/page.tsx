import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductBuy } from "@/components/product-buy";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await db.product.findFirst({ where: { slug, active: true } });
  return p ? { title: p.name, description: p.tagline } : {};
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await db.product.findFirst({ where: { slug, active: true } });
  if (!p) notFound();
  const related = await db.product.findMany({ where: { active: true, category: p.category, NOT: { id: p.id } }, take: 4 });

  return (
    <div className="wrap page">
      <p className="crumbs"><Link href="/shop">Shop</Link> / <Link href={`/shop?category=${p.category}`}>{p.category}</Link></p>
      <h1 className="page-title">{p.name}</h1>
      <p className="lede">{p.tagline}</p>
      <ProductBuy p={p} />
      <section className="details">
        <h2>Details</h2>
        <p>{p.description}</p>
        <ul>
          <li>100% organic ring-spun cotton, 5.3 oz</li>
          <li>Relaxed unisex fit; size up for oversized</li>
          <li>Machine wash cold, tumble low</li>
        </ul>
      </section>
      {related.length > 0 && (
        <section>
          <h2>You may also like</h2>
          <div className="grid flush">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
    </div>
  );
}
