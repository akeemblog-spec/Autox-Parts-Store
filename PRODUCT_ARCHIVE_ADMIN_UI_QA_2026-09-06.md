# AutoX Product Archive + Admin UI QA — 2026-09-06

## Implemented

- Product archive / restore system with `products.archived_at`.
- Permanent delete is allowed only when the product has no order or inventory history.
- Products with history return a controlled 409 response and can be archived instead.
- Archived products are hidden from storefront product queries, product details, related products, offers, brand/category product counts, Parts Finder/search results, and new cart additions.
- Checkout rejects a previously-added cart item if that product has since been archived.
- Admin Products has Active / Archived / All views and Archive / Restore actions.
- Low-stock attention counts and dashboard product inventory figures ignore archived products.
- Product, Inventory, and Customer page search controls are aligned with their page titles.
- Admin header search uses one controlled focus border without nested focus outlines.
- Admin sidebar is constrained to the viewport and its navigation area scrolls vertically with a compact scrollbar.
- Admin notifications close when clicking/tapping outside and when pressing Escape.

## Migration

`db/migrations/0008_product_archive_ui_hardening.sql`

Run:

```bash
npm run db:migrate
```

Do not run the seed against an existing populated database.

## QA performed

- TypeScript: PASS — 0 errors.
- ESLint: PASS — 0 errors, 22 existing `next/image` optimization warnings.
- Static feature/integrity assertions: 19/19 PASS.
- The TypeScript `qa:integrity` command could not be executed inside the Linux sandbox because the project dependencies available for local checking came from the user's Windows `node_modules`, and `tsx`/esbuild is platform-specific. The source assertions were executed independently instead.

## Recommended follow-up enhancements not added here

- Add a compact shared `AdminPageHeader` component so every Admin page uses identical title / description / search / action spacing.
- Add a small `Archived` count to the Products status filter.
- Add notification `Mark all as read` and a dedicated notification history view if notification volume grows.
- Add database-query timing/observability for slow Admin endpoints such as notification and attention-count queries.
- Add automated browser regression tests for product archive/restore, Admin sidebar scrolling, notification click-away, and search focus behavior.
