/** Public origin of the site, used for Stripe return URLs and email links. */
export function siteUrl() {
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
