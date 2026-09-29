# Threadline

Threadline is a full-stack online store for t-shirts. Shoppers can browse and filter the catalog, view products with animated artwork, build a cart, create an account, and check out securely, then receive an order confirmation email. Store owners get an admin area to manage products and fulfill orders. It is a demo project built for fun, and no real orders are fulfilled.

**Live demo:** https://threadline-lovat-two.vercel.app

## Features

- Home page with a hero image carousel, category tiles and featured products
- Shop with category filters and sorting, and product pages with color and size pickers
- Persistent cart, account registration and sign-in, and order history
- Checkout with Stripe (test mode), or a built-in demo mode without Stripe keys
- Order confirmation emails, and shipping addresses captured from Stripe
- Admin area to create, edit, feature, archive and delete products, and to manage orders (status, tracking numbers, shipping addresses)
- Responsive layout for phones, tablets and desktops, with automatic dark mode

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) 16 (App Router, Server Components, Server Actions, Proxy), [React](https://react.dev) 19 |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Database | [PostgreSQL](https://www.postgresql.org) 17 locally, [Neon](https://neon.tech) in production |
| ORM | [Prisma](https://www.prisma.io) 7 with the `pg` driver adapter, migrations and a seed script |
| Authentication | [Auth.js](https://authjs.dev) (next-auth v5) credentials provider with JWT sessions, passwords hashed with argon2id (`@node-rs/argon2`) |
| Payments | [Stripe](https://stripe.com) Checkout and webhooks |
| Email | [Nodemailer](https://nodemailer.com) over SMTP, with [Mailpit](https://mailpit.axllent.org) for local previews |
| Validation | [Zod](https://zod.dev) |
| Styling | Plain modern CSS, no framework: cascade layers, nesting, `oklch()` and `color-mix()`, `light-dark()`, container queries, `:has()`, scroll-driven animations, view transitions and the popover API |
| Graphics and animation | Hand-built SVG t-shirt artwork with CSS-animated details, self-drawing SVG strokes, and a scroll-snap carousel |
| Fonts | Bricolage Grotesque and Inter via `next/font` |
| Hosting | [Vercel](https://vercel.com) |
| Tooling | ESLint, `tsx`, Stripe CLI, Vercel CLI |

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
- `x-forwarded-for` is only trustworthy behind your own proxy (Vercel provides this). Outside Vercel, set `AUTH_URL` to your public URL.

## Deploying

The app runs on Vercel with a Neon Postgres database. `npm run vercel-build` applies pending migrations before building. Set `AUTH_SECRET` and `DATABASE_URL` (plus `DATABASE_URL_UNPOOLED` for migrations), and add the Stripe and SMTP variables to go beyond demo mode. Create the Stripe webhook destination with the same API version your Stripe library uses, pointing at `/api/stripe/webhook` and listening for `checkout.session.completed`.

## Layout

`src/lib/artwork.tsx` holds the animated SVG tee designs, `src/components/hero-carousel.tsx` the home carousel, `src/actions` the server actions, and `prisma/` the schema and seed.
