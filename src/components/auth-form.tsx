"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, register, type FormState } from "@/actions/auth";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? login : register, undefined);
  const fe = state?.fieldErrors ?? {};
  const isLogin = mode === "login";
  return (
    <form action={action} className="auth-form" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {!isLogin && (
        <label>Name
          <input name="name" autoComplete="name" required aria-invalid={!!fe.name} />
          {fe.name && <small className="form-error">{fe.name}</small>}
        </label>
      )}
      <label>Email
        <input name="email" type="email" autoComplete="email" required aria-invalid={!!fe.email} />
        {fe.email && <small className="form-error">{fe.email}</small>}
      </label>
      <label>Password
        <input name="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"} required minLength={isLogin ? undefined : 10} aria-invalid={!!fe.password} />
        {!isLogin && !fe.password && <small className="muted">10+ characters with upper, lower case and a number.</small>}
        {fe.password && <small className="form-error">{fe.password}</small>}
      </label>
      <p className="form-error" role="alert">{state?.error}</p>
      <button className="btn btn-dark block" disabled={pending}>{pending ? "One moment…" : isLogin ? "Sign in" : "Create account"}</button>
      <p className="muted center">
        {isLogin ? <>New here? <Link href="/register">Create an account</Link></> : <>Already have an account? <Link href="/login">Sign in</Link></>}
      </p>
    </form>
  );
}
