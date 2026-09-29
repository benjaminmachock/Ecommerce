# Threadline

A full-stack t-shirt store built for fun: Next.js 16 (App Router), PostgreSQL, Prisma 7, Auth.js, Stripe, and animated SVG artwork.

## Run it

```bash
brew install postgresql@17 && brew services start postgresql@17
createdb ecommerce
cp .env.example .env        # then set AUTH_SECRET: openssl rand -base64 33
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Without Stripe keys, checkout runs in **demo mode** (orders are marked paid, no charge). For real Stripe test mode, set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`, then run `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

## Order emails

A confirmation email goes to the customer when an order becomes paid (Stripe webhook, or immediately in demo mode). Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `EMAIL_FROM` in `.env` to use any SMTP provider (Resend, Postmark, SES, Gmail app password…). With `SMTP_HOST` empty, emails are printed to the server log. To preview them locally: `brew install mailpit && mailpit`, set `SMTP_HOST=localhost SMTP_PORT=1025`, and open http://localhost:8025.

## Admin area

Register on the site, then promote yourself: `npm run make-admin -- you@example.com`. An **Admin** link appears in the header and leads to `/admin`, where you can add, edit, feature, archive and delete products with a live shirt preview. Products that appear in past orders are archived instead of deleted so order history stays intact.

## Security notes

- Every admin page and every admin server action re-checks the admin role against the database (not the JWT), so revoking a role takes effect immediately.

- Passwords hashed with argon2id; sign-in uses one generic error and a dummy hash to blunt user enumeration and timing attacks.
- Postgres-backed rate limits on login, sign-up and checkout.
- Zod validation on all inputs; prices are re-read from the database at checkout, never trusted from the client.
- Orders are always queried by the signed-in user's id; open redirects blocked on `next=`.
- Per-request CSP nonce (`src/proxy.ts`), HSTS, frame denial, nosniff, referrer and permissions policies.
- The Stripe webhook saves the shipping address collected at checkout onto the order.
- Stripe webhook verifies the signature against the raw body.
- Sessions are signed JWT cookies (HttpOnly, SameSite=Lax; Secure in production). Auth.js Credentials requires JWT sessions.
- Set `AUTH_URL` in production. `x-forwarded-for` is only trustworthy behind your own proxy.

## Layout

`src/lib/artwork.tsx` holds the animated SVG tee designs, `src/components/hero-carousel.tsx` the home carousel, `src/actions` the server actions, and `prisma/` the schema and seed.
