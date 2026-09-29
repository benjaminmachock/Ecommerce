"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validation";

export type ProductFormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "product";

async function uniqueSlug(name: string) {
  const base = slugify(name);
  for (let n = 0; ; n++) {
    const slug = n === 0 ? base : `${base}-${n + 1}`;
    if (!(await db.product.findUnique({ where: { slug }, select: { id: true } }))) return slug;
  }
}

export async function saveProduct(id: string | null, _: ProductFormState, form: FormData): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    name: form.get("name"),
    tagline: form.get("tagline"),
    description: form.get("description"),
    price: form.get("price"),
    category: form.get("category"),
    artwork: form.get("artwork"),
    colors: form.getAll("colors"),
    sizes: form.getAll("sizes"),
    featured: form.get("featured") === "on",
    active: form.get("active") === "on",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { fieldErrors };
  }

  const { price, ...rest } = parsed.data;
  const data = { ...rest, priceCents: Math.round(price * 100) };

  if (id) {
    const exists = await db.product.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return { error: "That product no longer exists." };
    // Slug stays stable on edit so existing links keep working.
    await db.product.update({ where: { id }, data });
  } else {
    await db.product.create({ data: { ...data, slug: await uniqueSlug(data.name) } });
  }
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function toggleProduct(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const field = form.get("field");
  if (field !== "active" && field !== "featured") return;
  const p = await db.product.findUnique({ where: { id }, select: { active: true, featured: true } });
  if (!p) return;
  await db.product.update({ where: { id }, data: { [field]: !p[field] } });
  revalidatePath("/", "layout");
}

/** Products that appear in past orders are archived instead of deleted to keep order history intact. */
export async function deleteProduct(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const used = await db.orderItem.count({ where: { productId: id } });
  if (used > 0) await db.product.update({ where: { id }, data: { active: false, featured: false } });
  else await db.product.deleteMany({ where: { id } });
  revalidatePath("/", "layout");
}
