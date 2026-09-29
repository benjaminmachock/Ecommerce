import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Create account" };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if ((await auth())?.user) redirect("/account");
  const { next } = await searchParams;
  const safe = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;
  return (
    <div className="wrap auth-page">
      <h1 className="page-title">Join Threadline</h1>
      <p className="lede">Create an account to save your orders.</p>
      <AuthForm mode="register" next={safe} />
    </div>
  );
}
