"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { hash } from "@node-rs/argon2";
import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { loginSchema, registerSchema } from "@/lib/validation";

export type FormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

// Only allow same-site relative redirects (prevents open-redirect abuse).
const safeNext = (v: FormDataEntryValue | null) =>
  typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : "/account";

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Enter your email and password." };
  try {
    await signIn("credentials", { ...parsed.data, redirectTo: safeNext(form.get("next")) });
  } catch (e) {
    if (e instanceof AuthError) return { error: "Invalid email or password, or too many attempts. Try again later." };
    throw e; // redirects are thrown and must propagate
  }
}

export async function register(_: FormState, form: FormData): Promise<FormState> {
  const ip = await clientIp();
  if (!(await rateLimit(`register:ip:${ip}`, 5, 60 * 60))) {
    return { error: "Too many sign-ups from your network. Try again later." };
  }
  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { fieldErrors };
  }
  const { name, email, password } = parsed.data;
  const passwordHash = await hash(password);
  try {
    await db.user.create({ data: { name, email, passwordHash } });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      // Same message shape regardless, to limit account enumeration.
      return { error: "We couldn't create that account. Try signing in instead." };
    }
    throw e;
  }
  try {
    await signIn("credentials", { email, password, redirectTo: "/account" });
  } catch (e) {
    if (e instanceof AuthError) redirect("/login");
    throw e;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
