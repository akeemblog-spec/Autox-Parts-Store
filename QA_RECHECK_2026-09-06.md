# AutoX Frontend + Backend QA Recheck — 2026-09-06

## Critical regression fixed

The persistent storefront route-group layout imported `TopBar`, `Header`, `MainNavigation`, and `Footer` but returned only `{children}`. As a result, all routes under `app/(storefront)` rendered without the storefront chrome. The layout now renders the complete shell once around all storefront pages.

## Additional fixes found during the recheck

- Added `data-scroll-behavior="smooth"` to the root `<html>` element to resolve the Next.js smooth-scroll route-transition warning.
- Hardened `/api/account/profile` and `/api/account/settings` so invalidated JWT sessions are rejected consistently with cart, wishlist, orders, addresses, reviews, and returns.
- Fixed Parts Finder year-range normalization. The PostgreSQL regex now correctly strips whitespace from compatibility values such as `2018 - 2024`, so model/year matching is more reliable.
- Strengthened `qa:smoke` so it verifies actual storefront chrome content, not only HTTP 200 responses. This would have caught the missing Header/Footer regression.
- Added `qa:integrity` to verify the persistent storefront layout, critical storefront/admin routes, migration registration, and Blog removal.

## QA performed

- TypeScript: PASS, 0 errors.
- ESLint: PASS, 0 errors; 22 existing Next.js `<img>` optimization warnings remain.
- Storefront route-group integrity: PASS.
- Header / navigation / footer are rendered exactly once by `app/(storefront)/layout.tsx`.
- Storefront child pages no longer contain duplicate chrome wrappers.
- Admin API guard scan: all `app/api/admin/**` routes use `requireAdmin()` or `requireSuperAdmin()`.
- Authenticated API scan: all direct `auth()` API consumers now reject invalidated sessions.
- Blog navigation check: PASS; no Blog links were reintroduced.
- Migration journal check: PASS for `0006_full_qa_cleanup` and `0007_operations_enhancements`.

## Runtime limitation in this QA environment

A full Next.js production build cannot complete in this Linux sandbox because the supplied project dependencies contain the Windows native packages and the environment cannot download the Linux SWC package from npm (`EAI_AGAIN registry.npmjs.org`). TypeScript and ESLint were executed successfully using the available dependency tree. Use `npm run qa:integrity` and `npm run qa:smoke` on the Windows development machine for the final runtime smoke pass.
