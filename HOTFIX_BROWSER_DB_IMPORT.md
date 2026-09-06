# Hotfix: PostgreSQL server code leaking into the browser bundle

## Root cause
`components/Footer.tsx` imported `getStorefrontSettings()` and `getAllBrands()` directly. The Footer is used by several Client Components (cart, wishlist, product detail, etc.), so Next.js attempted to bundle the Footer's database imports into the browser. That pulled in `pg`, which requires Node-only modules such as `dns`, `fs`, `net`, `tls`, and `util/types`.

## Fix
- `components/Footer.tsx` is now a browser-safe Client Component and contains no direct database imports.
- Added `GET /api/storefront/footer` as a server-only endpoint that loads footer settings and top-brand data.
- Footer requests that endpoint and has safe fallback content if the CMS data request fails.
- Scanned all Client Components for direct runtime imports from `@/db` or `@/lib/db-queries`; zero remaining imports were found.
- `tsc --noEmit` passes with zero TypeScript errors.

## Build note
A full `next build` was also attempted. It reached Next.js successfully, but this sandbox cannot access npm to download `@next/swc-linux-x64-gnu`, so the build cannot finish here. Run `npm run build` on your Windows machine for the final production build check.

## Database
No new database migration is required for this hotfix beyond the migration already required by the CMS/account-enhanced release. Do not reseed the database.
