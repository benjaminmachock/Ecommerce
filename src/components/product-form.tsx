"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveProduct, type ProductFormState } from "@/actions/admin";
import { ARTWORK_KEYS, COLORS, Tee } from "@/lib/artwork";
import { CATEGORIES, SIZES } from "@/lib/catalog";

type Product = {
  id: string; name: string; tagline: string; description: string; priceCents: number;
  category: string; artwork: string; colors: string[]; sizes: string[]; featured: boolean; active: boolean;
};

export function ProductForm({ product }: { product?: Product }) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProduct.bind(null, product?.id ?? null), undefined);
  const fe = state?.fieldErrors ?? {};
  const [artwork, setArtwork] = useState(product?.artwork ?? "sunrise");
  const [colors, setColors] = useState<string[]>(product?.colors ?? ["Cream"]);

  const toggle = (c: string) => setColors((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  return (
    <form action={action} className="product-form" noValidate>
      <div className="pf-fields">
        <label>Name
          <input name="name" defaultValue={product?.name} maxLength={80} required aria-invalid={!!fe.name} />
          {fe.name && <small className="form-error">{fe.name}</small>}
        </label>
        <label>Tagline
          <input name="tagline" defaultValue={product?.tagline} maxLength={120} required aria-invalid={!!fe.tagline} />
          {fe.tagline && <small className="form-error">{fe.tagline}</small>}
        </label>
        <label>Description
          <textarea name="description" rows={5} defaultValue={product?.description} maxLength={1500} required aria-invalid={!!fe.description} />
          {fe.description && <small className="form-error">{fe.description}</small>}
        </label>
        <div className="pf-two">
          <label>Price (USD)
            <input name="price" type="number" inputMode="decimal" step="0.01" min="0.5" max="500" defaultValue={product ? (product.priceCents / 100).toFixed(2) : ""} required aria-invalid={!!fe.price} />
            {fe.price && <small className="form-error">{fe.price}</small>}
          </label>
          <label>Category
            <select name="category" defaultValue={product?.category ?? CATEGORIES[0]}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            {fe.category && <small className="form-error">{fe.category}</small>}
          </label>
        </div>
        <label>Design
          <select name="artwork" value={artwork} onChange={(e) => setArtwork(e.target.value)}>
            {ARTWORK_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>

        <fieldset className="opt">
          <legend>Colors</legend>
          <div className="opt-row">
            {Object.entries(COLORS).map(([name, hex]) => (
              <label key={name} className="swatch" title={name}>
                <input type="checkbox" name="colors" value={name} checked={colors.includes(name)} onChange={() => toggle(name)} />
                <span style={{ background: hex }} /><span className="sr-only">{name}</span>
              </label>
            ))}
          </div>
          {fe.colors && <small className="form-error">{fe.colors}</small>}
        </fieldset>

        <fieldset className="opt">
          <legend>Sizes</legend>
          <div className="opt-row">
            {SIZES.map((s) => (
              <label key={s} className="size">
                <input type="checkbox" name="sizes" value={s} defaultChecked={product ? product.sizes.includes(s) : true} /><span>{s}</span>
              </label>
            ))}
          </div>
          {fe.sizes && <small className="form-error">{fe.sizes}</small>}
        </fieldset>

        <div className="checks">
          <label><input type="checkbox" name="featured" defaultChecked={product?.featured} /> Featured on the home page</label>
          <label><input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Visible in the store</label>
        </div>

        <p className="form-error" role="alert">{state?.error}</p>
        <div className="buy-row">
          <button className="btn btn-dark" disabled={pending}>{pending ? "Saving…" : product ? "Save changes" : "Create product"}</button>
          <Link href="/admin" className="btn btn-ghost">Cancel</Link>
        </div>
      </div>

      <aside className="pf-preview" aria-label="Preview">
        <div className="pdp-media" style={{ "--tone": COLORS[colors[0]] ?? "#ccc" } as React.CSSProperties}>
          <Tee artwork={artwork} color={colors[0] ?? "Cream"} className="pdp-tee" label="Preview" />
        </div>
        <p className="muted small center">Live preview (first selected color)</p>
      </aside>
    </form>
  );
}
