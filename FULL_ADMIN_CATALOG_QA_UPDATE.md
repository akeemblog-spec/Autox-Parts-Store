# AutoX — Admin Redesign, Catalog & Storefront Consistency Pass

This build extends the CMS/account hotfix without replacing the existing Supabase/PostgreSQL database or reseeding data.

## Implemented

- Redesigned Admin shell inspired by the supplied AutoX reference: fixed dark sidebar, top admin header, grouped navigation, responsive mobile drawer, dashboard cards/tables/charts.
- Dashboard uses real database data for orders, sales, customers, pending orders, low-stock products, sales trend, order-status totals, top-selling products and recent orders.
- Added Admin Inventory, Customers and Reviews views.
- Admin Orders now has an order-details drawer showing the actual ordered items, quantities, order-time prices, customer details, delivery address, totals and status history.
- Admin order status updates create timestamped history entries only when the status actually changes.
- Shared customer/admin order timeline connector lines stop at icon edges rather than drawing through the circles.
- Track Order and My Orders continue to use the same persisted status-history timestamps.
- Account navigation now keeps the selected page visibly active.
- Account Settings uses the corrected reusable AutoX toggle switch.
- Saved default delivery address is automatically loaded into Cart checkout delivery fields.
- Address create/edit/delete re-fetches the database state so exactly one default address is represented correctly in UI.
- Bike navigation now links to `/bikes`, which contains only active bike brands plus bike products.
- Three Wheelers uses only active three-wheeler brands/products.
- Main navigation brand dropdowns are database-driven. Newly-created active brands appear automatically after navigation/reload; deleted/disabled brands disappear.
- Footer Top Brands is database-driven instead of static.
- Brand and category storefront listings use live database product counts and catalog sort order.
- Dynamic `/brands/[slug]` route supports newly-created brands without adding source files manually.
- Brand pages display the real live parts count and use the Admin cover image for the hero where configured.
- Vehicle Finder and search category dropdown now use active Admin-managed taxonomy data.
- Catalog delete safeguards prevent deleting brands/categories/vehicle types/part types still referenced by products/brands. Disable or reassign first.
- Catalog create/edit/delete re-fetches the server state after mutations instead of maintaining a second stale copy.
- Storefront Hero/Promo create/edit/delete re-fetches the server state after mutations. This fixes the temporary duplicate slide/banner that disappeared only after manual refresh.
- Add-to-cart motorcycle animation now travels across the full button from left to right.
- Added state no longer turns green; it stays in the AutoX black/red theme.
- Admin Store Settings / Shipping settings sections added. Standard delivery fee is stored in site settings and applied to newly-created orders.
- `sortOrder` for brands/categories is now respected by homepage and listing queries.

## Database

No new schema migration is introduced by this pass. It uses the CMS/tracking schema already included in migration `0002_storefront_cms_tracking.sql`.

If that migration was already applied, do not seed or recreate the database.

If it has not been applied yet, run:

```cmd
npm run db:migrate
```

Do not run `npm run db:seed` against your existing populated Supabase database.

## Validation performed

- `tsc --noEmit` — PASS, zero TypeScript errors.
- Client/server boundary scan — no runtime database query imports were found in Client Components. The only db-query reference in a Client Component is a TypeScript `import type`, which is erased from the browser build.
- Next production build was attempted. It stops before compilation because this sandbox cannot download `@next/swc-linux-x64-gnu` from npm (`EAI_AGAIN registry.npmjs.org`). Run `npm run build` on the Windows development machine.
- ESLint CLI was attempted, but this project uses `.eslintrc.json` while installed ESLint is v9, which requires `eslint.config.*`; this is an existing tooling configuration mismatch and not an application TypeScript error.

## Suggested local QA sequence

1. Start with `npm run dev`.
2. Add a temporary active Vehicle Type / Part Type / Brand / Category in Admin Catalog.
3. Verify the Brand appears in the correct Bike or Three-Wheeler menu and Footer.
4. Create a Product using those newly-created values.
5. Verify the product on Products, Brand page, Category page and the correct vehicle-type page.
6. Verify the Brand/Category part count increments and respects Admin sort order.
7. Add two Hero slides. Save each and confirm only one copy appears immediately without browser refresh. Delete one and confirm the UI updates immediately.
8. Add to cart and verify the motorcycle travels from the far left to the far right; success remains AutoX dark/red.
9. Set a default Account address and open Cart; delivery details should be prefilled.
10. Place an order and open Admin > Orders; use the eye button to inspect the exact products/quantities/prices.
11. Progress the order through statuses and compare timestamps in Admin, My Orders and Track Order.
12. Run `npm run build` locally before deployment.
