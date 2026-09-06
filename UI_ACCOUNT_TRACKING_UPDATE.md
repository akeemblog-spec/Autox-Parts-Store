# AutoX Account + Tracking UI Update

## Implemented

- Rebuilt `/account` to follow the supplied AutoX dark/red account-dashboard reference.
- Responsive account navigation, customer summary, real order/wishlist/review metrics, recent-order card, order progress, security/benefits/support cards and service strip.
- Added `/orders/track` using the supplied tracking-dashboard reference.
- Track Order is secured to the signed-in customer and searches that customer's real AutoX order number.
- The tracking UI uses the real order status, delivery address, payment method, total and created date from PostgreSQL.
- Existing Admin order status changes automatically feed the Account and Track Order progress UI.
- Fixed desktop navigation dropdown clipping by removing the horizontal overflow container and raising dropdown stacking order.
- Added motorcycle-themed Add to Cart microinteraction on product cards, live product grids, product detail and wishlist.
- Added cart icon/badge pulse feedback in the header after cart updates.
- Fixed the Admin payment-method toggle active-state thumb positioning and ON-state styling.
- Preserved reduced-motion accessibility behavior.

## Tracking model note

The current database has one authoritative order `status` field but does not yet store courier scan history. The new tracking page therefore renders a truthful progress view from that real status rather than inventing scan events/timestamps. It displays `AutoX Islandwide Delivery` and the AutoX order number as the tracking reference until a third-party courier integration or dedicated tracking-history table is added.

## Validation

`tsc --noEmit` passes with zero TypeScript errors.

A full Next.js production build was attempted. It reaches Next.js successfully, but this sandbox cannot download `@next/swc-linux-x64-gnu` because outbound npm access is blocked. Run `npm run build` on the Windows development machine for the final production build check.

## Local setup

Reuse the existing `.env.local` and existing Neon database. No new database migration or reseeding is required for this UI/tracking update.

Run:

```bash
npm install
npm run dev
```

Then test:

1. `/account` desktop + mobile.
2. `/orders/track` with an order number from the signed-in customer.
3. Admin order status update -> refresh Account/Track Order -> verify progress changes.
4. Add to Cart from product cards, listing grid, product detail, and wishlist.
5. Header cart badge pulse/count refresh.
6. Bikes/Three Wheelers dropdown menus at common desktop/tablet widths.
7. Admin Settings payment toggle OFF and ON visual states.
