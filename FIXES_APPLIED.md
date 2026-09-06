# AutoX stabilization fixes

This copy includes a focused stability pass for the issues observed in the supplied terminal log.

## Fixed
- Updated Next.js 16 dynamic route/page `params` handling to await Promise params.
- Fixed affected product detail/category pages and product/cart/wishlist/order/admin API routes.
- Wired the previously non-functional `ProductCard` Add to Cart button to `/api/cart`.
- Wired ProductCard wishlist add/remove behavior.
- Added live cart and wishlist header counts and update events after mutations.
- Removed the incorrect hard-coded default cart badge count of 3.
- Normalized product part-type filter values to backend enum values.
- Added product existence/out-of-stock/available-stock validation when adding to cart.
- Added stock validation when updating cart quantities.
- Updated product-detail and live-grid cart actions to refresh the header count.
- Updated `drizzle.config.ts` to explicitly load `.env.local` and fail clearly when DATABASE_URL is missing.
- Added `data-scroll-behavior="smooth"` to the root html element for Next.js route-transition warning compatibility.

## Validation performed
- `tsc --noEmit` passes with no TypeScript errors.
- A Next.js production build was attempted. It could not complete in the sandbox because Next.js tried to download a Linux SWC package from registry.npmjs.org, while this environment has no external package-network access. Run `npm run build` on your Windows machine after `npm install` for the final platform-native production build check.

## Important setup
The ZIP deliberately does not include `.env.local` or `node_modules`.

1. Copy your existing `.env.local` into the project root.
2. Run `npm install`.
3. Run `npm run db:migrate` (only if needed for your database).
4. Run `npm run dev`.
5. Test register/login, product detail, add/update/remove cart, wishlist, admin product edit/delete, payment methods and order status.
6. Run `npm run build` before deployment.
