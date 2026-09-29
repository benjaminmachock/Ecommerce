import { z } from "zod";
import { CATEGORIES, SIZES } from "@/lib/catalog";
import { ARTWORK_KEYS, COLORS } from "@/lib/artwork";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email("Enter a valid email")),
  password: z
    .string()
    .min(10, "Use at least 10 characters")
    .max(128)
    .refine((p) => /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p), "Mix upper, lower case and a number"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  password: z.string().min(1).max(128),
});

export const cartSchema = z
  .array(
    z.object({
      productId: z.string().min(1).max(40),
      size: z.string().min(1).max(8),
      color: z.string().min(1).max(30),
      quantity: z.number().int().min(1).max(10),
    }),
  )
  .min(1)
  .max(30);

export const productSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  tagline: z.string().trim().min(2, "Add a short tagline").max(120),
  description: z.string().trim().min(10, "Describe the product").max(1500),
  price: z.coerce.number({ error: "Enter a price" }).min(0.5, "Minimum $0.50").max(500, "Maximum $500"),
  category: z.enum(CATEGORIES, { error: "Pick a category" }),
  artwork: z.string().refine((a) => ARTWORK_KEYS.includes(a), "Pick a design"),
  colors: z.array(z.string().refine((c) => c in COLORS)).min(1, "Pick at least one color"),
  sizes: z.array(z.enum(SIZES)).min(1, "Pick at least one size"),
  featured: z.boolean(),
  active: z.boolean(),
});

export const orderUpdateSchema = z.object({
  status: z.enum(["PENDING", "PAID", "SHIPPED", "CANCELLED"]),
  trackingNumber: z.string().trim().max(60).regex(/^[A-Za-z0-9 -]*$/, "Letters, numbers, spaces and dashes only").optional(),
});
