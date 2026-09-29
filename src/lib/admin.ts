import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * Authorization check for every admin page AND every admin server action.
 * The role is read from the database, not the JWT, so demoting an admin takes
 * effect immediately instead of when their session expires.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/admin");
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true } });
  if (user?.role !== "ADMIN") redirect("/");
  return user;
}
