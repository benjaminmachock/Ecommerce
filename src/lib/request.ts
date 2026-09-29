import { headers } from "next/headers";

/** Best-effort client IP. Only trustworthy when deployed behind a proxy that sets x-forwarded-for. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
