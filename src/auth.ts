import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verify } from "@node-rs/argon2";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

// Verified against when the email is unknown so response time doesn't reveal which emails exist.
const DUMMY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHRzb21lc2FsdA$Zb0k0S8m8Fq0y2q7kq0l4Jq3z0y2c7c8m1o5m0o9q1w";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw, request) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        const [okEmail, okIp] = await Promise.all([
          rateLimit(`login:email:${email}`, 8, 15 * 60),
          rateLimit(`login:ip:${ip}`, 30, 15 * 60),
        ]);
        if (!okEmail || !okIp) return null;

        const user = await db.user.findUnique({ where: { email } });
        let valid = false;
        try {
          valid = await verify(user?.passwordHash ?? DUMMY_HASH, password);
        } catch {
          valid = false;
        }
        if (!user || !valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id;
      if (token.role) session.user.role = token.role;
      return session;
    },
  },
});
