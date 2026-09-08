# AutoX UI/UX Order, Account, Hero & Launch Experience Hotfix — 2026-09-08

Base: `autox-parts-store-modern-ui-ux-hero-mobile-enhanced`

## Implemented

- Track Order order summary now renders every order item snapshot with product name, quantity, unit price and line total.
- Track Order pricing now clearly separates subtotal, standard delivery fee, express delivery fee (red), coupon discount and final total.
- Track Order adds a dedicated delivery information area with delivery type, address, contact number, courier/service and payment method.
- My Orders cards now use a cleaner item preview + dedicated price breakdown layout with Standard/Express delivery treatment and final total.
- Shared order timeline and tracking update UI were refined for clearer current/completed/pending states on desktop and mobile.
- Removed the account/full-storefront route skeleton files that were causing large skeleton swaps during account tab navigation. Account navigation stays visible while navigation resolves instead of flashing a full dashboard skeleton.
- Added a homepage-only AutoX launch experience using an animated red superbike, spinning wheels, motion streaks, progress animation and a smooth homepage reveal. This is not a generic spinner.
- Hero slider indicators were moved into normal layout flow so they cannot be covered by the Vehicle Finder.
- Slider indicators have stronger inactive/active contrast, progress animation and desktop previous/next controls.
- Removed the floating “AutoX fitment / Parts matched to your ride” image label that could collide with the motorcycle/tire artwork.
- Vehicle Finder no longer uses a negative desktop margin and now sits below the Hero with intentional spacing.
- Existing CMS-controlled Hero content, images, CTA links, autoplay, interval and pause-on-hover behavior remain unchanged at the data level.
- No database schema, authentication, order logic, pricing logic, admin permissions, CMS storage or checkout API changes.

## QA performed in container

- TypeScript transpile/syntax diagnostics passed for every changed TS/TSX file.
- Updated `scripts/qa-integrity.ts` and ran it through the TypeScript compiler runtime: all integrity checks passed.
- Verified QA assertions for order line items, Express fee styling/content, My Orders breakdown, Hero indicator safety, Vehicle Finder spacing, homepage launch experience and account skeleton removal.
- No migration required.
- No seed required.

## Local verification

Run:

```cmd
npm install
npm run lint
npm run build
npm run qa:integrity
npm run dev
```

Do not run `npm run db:seed` against an existing populated database.
