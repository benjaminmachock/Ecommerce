import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: "CUSTOMER" | "ADMIN" } & DefaultSession["user"];
  }
  interface User {
    role?: "CUSTOMER" | "ADMIN";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: "CUSTOMER" | "ADMIN";
  }
}
