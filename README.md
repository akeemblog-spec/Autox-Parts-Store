# AutoX Parts Store — Full-Stack App

A production motorcycle, three-wheeler, and automotive parts e-commerce
platform. Next.js (App Router) + TypeScript + Tailwind CSS on the frontend,
PostgreSQL + Drizzle ORM on the backend, Auth.js (NextAuth v5) for
authentication.

## What's included

- **Storefront**: homepage, brand pages, category pages, product listing +
  detail, cart, wishlist, compare — all reading live from the database.
- **Auth**: email/password registration and login, JWT sessions, customer
  vs admin roles.
- **Admin dashboard** (`/admin`, admin-only): stats overview, product CRUD
  (inline edit price/stock, delete), order management (view + update
  status), and payment method toggles.
- **Payment methods, admin-controlled**: Cash on Delivery and Bank Transfer
  are live by default. Koko and Mintpay (Sri Lankan buy-now-pay-later
  providers) are pre-wired in the schema and admin UI but shipped
  **disabled** until you connect their merchant APIs — flip them on from
  `/admin/settings` once that's done. The checkout API independently
  re-validates the chosen method server-side, so a disabled method can't be
  used even via a direct API call.
- **Orders**: checkout creates a real order, snapshots prices, clears the
  cart.

## Getting started

### 1. Database

You need a Postgres database. Locally, the easiest path is Docker:

```bash
docker run --name autox-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=autox_dev -p 5432:5432 -d postgres:16
```

Or use a free hosted instance from [Neon](https://neon.tech) or
[Supabase](https://supabase.com) — either works fine for local dev too.

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

- `DATABASE_URL` — your Postgres connection string
- `AUTH_SECRET` — generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3000` for local dev
- `AUTH_TRUST_HOST` — set to `true` for local dev and any deployment where
  the host isn't automatically trusted (Auth.js v5 requires this outside
  of a few auto-detected platforms)

### 3. Install, migrate, seed

```bash
npm install
npm run db:migrate   # creates all tables
ALLOW_DEV_SEED_ADMIN=true DEV_SEED_ADMIN_PASSWORD="use-a-unique-12+-char-dev-password" npm run db:seed
# Development databases only. Do not seed a populated/production database.
```

The optional development seed can create `admin@autoxparts.lk`, but only when explicitly enabled. The password must be supplied through `DEV_SEED_ADMIN_PASSWORD`; it is never hard-coded or printed.

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000. Visit `/admin` after logging in as the seeded
admin to see the dashboard.

## Architecture

```
app/                      Next.js App Router routes
  api/                     Route handlers (the "backend")
    products/                Public product read endpoints
    cart/, wishlist/         Authenticated cart/wishlist mutations
    orders/                  Checkout + order history
    payment-methods/         Public: which payment methods are enabled
    auth/                    NextAuth handler + registration
    admin/                   Admin-only: product/order CRUD, payment toggles
  admin/                   Admin dashboard pages (server-rendered, role-gated)
  (storefront pages)       Homepage, brand/category/product pages, cart, etc.

components/                Reusable UI components
  admin/                    Admin dashboard components
  auth/                     Login/register forms, session provider
  pages/                    Larger page-body components used by routes
  ui/                       Base primitives (Button, Badge, Rating, etc.)

db/
  schema.ts                 Drizzle schema — every table, every relation
  index.ts                  Database client (swap-friendly, see below)
  seed.ts                   Seeds the DB from lib/data (dev/reset use)
  migrations/                Generated SQL migrations

lib/
  db-queries/                Query functions used by pages and API routes
  services/                  Business logic (product filtering/sorting)
  auth-guards.ts              requireAdmin() helper for API routes
  data/                      Original static mock data (kept as seed source)
```

### Why no middleware?

An earlier version of this app used Next.js Edge middleware for route
protection. It was removed after hitting a real bug in this Next.js/Auth.js
version combination on the Edge runtime (`Cannot redefine property:
__import_unsupported`, caused by the Edge bundle double-including a
polyfill). Route protection now happens directly in each protected page
(`app/admin/layout.tsx`, `app/account/page.tsx`) via a server-side
`await auth()` check and `redirect()` — functionally equivalent, runs in
the normal Node runtime, and sidesteps the Edge runtime bug entirely. Every
mutating API route also independently checks the session
(`requireAdmin()` / `auth()`), so protection isn't only at the page level.

## Payment methods

Toggle in `/admin/settings`. Under the hood:

- A `payment_methods` table holds one row per method (`cod`,
  `bank_transfer`, `koko`, `mintpay`, plus `card`/`installment` reserved
  for later) with an `enabled` boolean and a `config` JSON field for future
  provider credentials.
- `GET /api/payment-methods` (public) returns only enabled methods — this
  is what the checkout page reads to build its payment method list.
- `POST /api/orders` (checkout) re-checks the chosen method against the
  database before creating the order, rejecting it with a 400 if it's been
  disabled — even if the request didn't come through the checkout UI.

### Adding Koko / Mintpay for real

1. Get merchant credentials from Koko/Mintpay.
2. Store them in that method's `config` column (or in env vars, if you
   prefer — either works, `config` is there for convenience).
3. Add a webhook route, e.g. `app/api/webhooks/koko/route.ts`, that
   verifies the provider's signature and updates `orders.status` /
   inserts a `payments` row on confirmation.
4. Add the redirect-to-provider step in the checkout flow when that method
   is selected.
5. Flip the toggle on in `/admin/settings`.

None of this requires touching the rest of the app — the toggle and the
checkout validation are already wired to respect it.

## Deploying (Vercel + Neon/Supabase)

1. Push this repo to GitHub.
2. Create a Postgres database on [Neon](https://neon.tech) or
   [Supabase](https://supabase.com). **Use the pooled connection string**
   if Neon offers one — Vercel's serverless functions open a new DB
   connection per invocation, and pooling prevents exhausting your
   connection limit under load. (If using Supabase, use their connection
   pooler on port 6543, not the direct connection.)
3. Run migrations against that database once, from your machine:
   ```bash
   DATABASE_URL="<your-connection-string>" npm run db:migrate
   DATABASE_URL="<your-connection-string>" npm run db:seed
   ```
4. Import the repo in [Vercel](https://vercel.com/new). It auto-detects
   Next.js.
5. Set environment variables in the Vercel project settings:
   - `DATABASE_URL` — same connection string
   - `AUTH_SECRET` — generate a fresh one for production, don't reuse the
     dev one: `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your Vercel deployment URL
   - `AUTH_TRUST_HOST` — `true`
6. Deploy. Every push to your main branch redeploys automatically.

### After deploying

- Log in with the seeded admin account and **change the password** (there's
  no self-service password change UI yet — update it directly via
  `UPDATE users SET password_hash = ... WHERE email = ...` using a fresh
  bcrypt hash, or add a password-change page).
- Review `/admin/settings` and confirm only the payment methods you're
  ready to accept are enabled.

## Known gaps (by design, for this phase)

- No rate limiting on API routes.
- No webhook signature verification (needed once Koko/Mintpay are wired up
  for real).
- No email verification or password reset flow.
- Checkout uses a hardcoded demo address rather than a real address form —
  the `addresses` table and API support real addresses, the UI just
  doesn't collect one yet.
- Images are placeholder SVGs generated locally; swap `lib/data/*.ts` image
  paths (or the DB rows they seed) for real hosted asset URLs
  (Cloudinary, Vercel Blob, etc.) before going live.
