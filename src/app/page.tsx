import Link from "next/link";
import { db } from "@/lib/db";
import { Tee } from "@/lib/artwork";
import { HeroCarousel, type Slide } from "@/components/hero-carousel";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic"; // per-request CSP nonce requires dynamic rendering

const SLIDES: Slide[] = [
  { eyebrow: "Summer drop", title: "Wear the good light.", body: "Our Golden Hour tee catches the last rays of the day. Organic cotton, zero regrets.", cta: { href: "/product/golden-hour-tee", label: "Shop Golden Hour" }, artwork: "sunrise", color: "Cream", bg: "oklch(88% 0.13 92)" },
  { eyebrow: "Limited run", title: "Out of this world.", body: "The Slow Orbit tee is a limited drop. When the batch is gone, it's gone.", cta: { href: "/shop?category=Limited", label: "See limited drops" }, artwork: "orbit", color: "Black", bg: "oklch(82% 0.09 235)" },
  { eyebrow: "Everyday", title: "Softer every wash.", body: "Six colors of the tee you'll reach for first. Pre-washed, pre-loved, pre-shrunk.", cta: { href: "/shop?category=Essentials", label: "Shop essentials" }, artwork: "plain", color: "Sage", bg: "oklch(90% 0.06 20)" },
  { eyebrow: "Vintage club", title: "Peaks and good vibes.", body: "Faded prints inspired by weekend trips and old postcards.", cta: { href: "/shop?category=Vintage", label: "Explore vintage" }, artwork: "mountain", color: "Navy", bg: "oklch(76% 0.13 45)" },
];

const CATEGORIES = [
  { name: "Graphic", artwork: "wave", color: "Sky", blurb: "Bold, playful, animated in spirit." },
  { name: "Vintage", artwork: "smile", color: "Terracotta", blurb: "Soft-faded throwbacks." },
  { name: "Essentials", artwork: "plain", color: "Butter", blurb: "Plain, perfect, priced right." },
];

const MARQUEE = ["Organic cotton", "Water-based inks", "Small batch", "Free returns", "Made to last", "Unisex fit"];

export default async function Home() {
  const featured = await db.product.findMany({ where: { featured: true, active: true }, orderBy: { createdAt: "asc" }, take: 8 });
  return (
    <>
      <HeroCarousel slides={SLIDES} />

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((t, i) => <span key={i}>{t} <b>✺</b></span>)}
        </div>
      </div>

      <section className="wrap section">
        <header className="section-head">
          <h2>Shop by vibe</h2>
          <Link href="/shop" className="text-link">All tees →</Link>
        </header>
        <div className="cats">
          {CATEGORIES.map((c) => (
            <Link key={c.name} href={`/shop?category=${c.name}`} className="cat reveal">
              <Tee artwork={c.artwork} color={c.color} className="cat-tee" label="" />
              <span className="cat-name">{c.name}</span>
              <span className="muted">{c.blurb}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section featured">
        <div className="wrap section-head">
          <h2>Fan favorites</h2>
          <Link href="/shop" className="text-link">Shop all →</Link>
        </div>
        <div className="grid">
          {featured.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      <section className="wrap section values">
        {[
          ["Organic ring-spun cotton", "Grown without synthetic pesticides and spun for a buttery feel."],
          ["Printed to last", "Water-based inks soak into the fibers instead of sitting on top."],
          ["Fits like a favorite", "A relaxed unisex cut, sized XS to XXL. Exchanges are free."],
        ].map(([t, b], i) => (
          <div key={t} className="value reveal">
            <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><circle className="value-ring" cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="2.5" pathLength="1" /><text x="20" y="26" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">{i + 1}</text></svg>
            <h3>{t}</h3>
            <p className="muted">{b}</p>
          </div>
        ))}
      </section>

      <section className="wrap section">
        <blockquote className="quote reveal">
          <p>“Softest shirt I own, and strangers keep asking where it&apos;s from.”</p>
          <footer>— Maya R., verified buyer</footer>
        </blockquote>
      </section>
    </>
  );
}
