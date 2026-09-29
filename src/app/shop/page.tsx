import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { CATEGORIES } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = { title: "Shop all tees" };
export const dynamic = "force-dynamic";

const SORTS = { new: "Newest", low: "Price: low to high", high: "Price: high to low" } as const;

export default async function Shop({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string }> }) {
  const sp = await searchParams;
  const category = (CATEGORIES as readonly string[]).includes(sp.category ?? "") ? sp.category : undefined;
  const sort = sp.sort && sp.sort in SORTS ? (sp.sort as keyof typeof SORTS) : "new";
  const products = await db.product.findMany({
    where: { active: true, ...(category ? { category } : {}) },
    orderBy: sort === "low" ? { priceCents: "asc" } : sort === "high" ? { priceCents: "desc" } : { createdAt: "asc" },
  });
  const href = (c?: string, s = sort) => `/shop?${new URLSearchParams({ ...(c ? { category: c } : {}), ...(s !== "new" ? { sort: s } : {}) })}`;

  return (
    <div className="wrap page">
      <h1 className="page-title">{category ?? "All tees"}</h1>
      <div className="filters">
        <nav className="chips" aria-label="Categories">
          <Link href={href(undefined)} aria-current={!category}>All</Link>
          {CATEGORIES.map((c) => <Link key={c} href={href(c)} aria-current={category === c}>{c}</Link>)}
        </nav>
        <nav className="chips" aria-label="Sort">
          {(Object.keys(SORTS) as (keyof typeof SORTS)[]).map((k) => <Link key={k} href={href(category, k)} aria-current={sort === k}>{SORTS[k]}</Link>)}
        </nav>
      </div>
      <p className="muted">{products.length} {products.length === 1 ? "tee" : "tees"}</p>
      <div className="grid flush">
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
