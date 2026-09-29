import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if ((await auth())?.user) redirect("/account");
  const { next } = await searchParams;
  const safe = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;
  return (
    <div className="wrap auth-page">
      <h1 className="page-title">Welcome back</h1>
      <p className="lede">Sign in to check out and see your orders.</p>
      <AuthForm mode="login" next={safe} />
    </div>
  );
}
