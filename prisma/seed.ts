import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const products = [
  { slug: "golden-hour-tee", name: "Golden Hour Tee", tagline: "Wear the last light of the day.", category: "Graphic", artwork: "sunrise", priceCents: 3400, colors: ["Cream", "Sage", "Navy"], featured: true },
  { slug: "low-tide-tee", name: "Low Tide Tee", tagline: "Four waves, zero worries.", category: "Graphic", artwork: "wave", priceCents: 3400, colors: ["Sky", "Cream", "Black"], featured: true },
  { slug: "summit-club-tee", name: "Summit Club Tee", tagline: "Peaks, stars and a slow morning.", category: "Vintage", artwork: "mountain", priceCents: 3800, colors: ["Navy", "Terracotta", "Cream"], featured: true },
  { slug: "wildflower-tee", name: "Wildflower Tee", tagline: "Blooms that never wilt in the wash.", category: "Graphic", artwork: "bloom", priceCents: 3600, colors: ["Blush", "Butter", "Black"], featured: true },
  { slug: "slow-orbit-tee", name: "Slow Orbit Tee", tagline: "Same planet, better shirt.", category: "Limited", artwork: "orbit", priceCents: 4200, colors: ["Black", "Sky"], featured: false },
  { slug: "pixel-pulse-tee", name: "Pixel Pulse Tee", tagline: "A 5x5 grid of good vibes.", category: "Limited", artwork: "dots", priceCents: 4200, colors: ["Butter", "Black", "Sage"], featured: true },
  { slug: "big-grin-tee", name: "Big Grin Tee", tagline: "Guaranteed to be smiled back at.", category: "Vintage", artwork: "smile", priceCents: 3600, colors: ["Cream", "Terracotta", "Sky"], featured: true },
  { slug: "voltage-tee", name: "Voltage Tee", tagline: "Charged up and ready.", category: "Limited", artwork: "bolt", priceCents: 4000, colors: ["Black", "Navy", "Butter"], featured: false },
  { slug: "everyday-tee", name: "Everyday Tee", tagline: "The one you'll reach for first.", category: "Essentials", artwork: "plain", priceCents: 2400, colors: ["Cream", "Black", "Sage", "Terracotta", "Navy", "Blush"], featured: false },
  { slug: "heavyweight-tee", name: "Heavyweight Tee", tagline: "6.5 oz cotton with a proper drape.", category: "Essentials", artwork: "plain", priceCents: 3200, colors: ["Black", "Cream", "Navy"], featured: false },
  { slug: "sunday-tee", name: "Sunday Tee", tagline: "Rays for lazy weekends.", category: "Vintage", artwork: "sunrise", priceCents: 3800, colors: ["Blush", "Butter"], featured: false },
  { slug: "deep-blue-tee", name: "Deep Blue Tee", tagline: "Ride it out.", category: "Vintage", artwork: "wave", priceCents: 3600, colors: ["Navy", "Terracotta"], featured: false },
];

async function main() {
  for (const p of products) {
    await db.product.upsert({
      where: { slug: p.slug },
      update: { ...p, sizes: SIZES, description: describe(p.name) },
      create: { ...p, sizes: SIZES, description: describe(p.name) },
    });
  }
  console.log(`Seeded ${products.length} products`);
}

const describe = (name: string) =>
  `${name} is cut from 100% organic ring-spun cotton with a relaxed unisex fit, a ribbed crew neck and double-needle stitching. Pre-washed for softness, printed with water-based inks, and made to get better with every wash.`;

main().finally(() => db.$disconnect());
