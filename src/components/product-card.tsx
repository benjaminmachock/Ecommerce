import Link from "next/link";
import { COLORS, Tee } from "@/lib/artwork";
import { formatPrice } from "@/lib/money";

type P = { slug: string; name: string; category: string; artwork: string; priceCents: number; colors: string[] };

export function ProductCard({ p }: { p: P }) {
  return (
    <article className="card reveal">
      <Link href={`/product/${p.slug}`} className="card-media" style={{ "--tone": COLORS[p.colors[0]] } as React.CSSProperties}>
        <Tee artwork={p.artwork} color={p.colors[0]} className="card-tee" label={p.name} />
        <span className="badge">{p.category}</span>
      </Link>
      <div className="card-body">
        <h3><Link href={`/product/${p.slug}`}>{p.name}</Link></h3>
        <p className="price">{formatPrice(p.priceCents)}</p>
      </div>
      <p className="swatches" aria-label={`${p.colors.length} colors`}>
        {p.colors.map((c) => <i key={c} title={c} style={{ background: COLORS[c] }} />)}
      </p>
    </article>
  );
}
