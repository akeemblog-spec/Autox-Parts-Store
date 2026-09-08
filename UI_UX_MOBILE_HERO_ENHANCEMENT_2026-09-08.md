# AutoX UI/UX Mobile + Hero Enhancement — 2026-09-08

This pass was applied on top of the QA-fixed V2 package without changing database schema, API contracts, authentication rules, checkout logic, order logic, admin permissions, or CMS storage.

## Implemented

- Mobile header now uses Wishlist on the right side with a live AutoX red count badge.
- Unified storefront count badge style for Cart, Wishlist and Compare; removed the white Cart count circle.
- Mobile drawer accordions expand to their natural content height with no nested submenu scrollbar. Only the main drawer scrolls when necessary.
- Mobile drawer active-route styling, larger touch targets, cleaner accordion controls and footer shortcuts for Wishlist, Compare and Track Order.
- Live Compare count is refreshed in the header and mobile drawer.
- Floating mobile dock refined with a lighter active state, improved touch areas, red Cart badge, and Search active only while the Search panel is open.
- Category bottom sheet retains real CMS/catalog data, hides distracting touch scrollbar chrome and uses a subtle overflow fade.
- Filter drawer restructured so the header remains fixed while only filter content scrolls.
- Wishlist page redesigned for mobile and desktop with stronger hierarchy, larger touch targets, polished empty state, branded toasts, rollback on failed removal, and Add-to-Cart feedback.
- Compare page now has a dedicated mobile experience rather than a desktop-only wide table. It includes product cards, 0–4 counter, remove, Clear All, Wishlist and Add-to-Cart actions. Desktop comparison remains table-based.
- Product cards are visually simplified on mobile: Wishlist remains on the image, Add to Cart stays primary, Compare becomes a compact icon action, and in-card status messages were replaced by global branded toasts.
- Product cards hydrate real Wishlist/Compare membership from a shared client cache so saved state does not always begin visually false.
- Added shared saved-product state cache to prevent every product card from issuing its own duplicate Wishlist/Compare requests.
- Full Hero redesign for desktop and mobile while preserving the existing CMS slide fields, autoplay, interval and pause-on-hover behavior.
- Hero now uses stronger typography, restrained red automotive glow, technical grid treatment, large product imagery, cleaner CTAs, trust strip, slider progress, desktop previous/next controls and reduced visual clutter.
- Vehicle Finder restyled to visually connect with the redesigned Hero while keeping the existing live catalog data and query behavior.
- Global mobile toasts now sit above the floating dock instead of overlapping it.
- Existing reduced-motion support remains in place.

## Safety / regression approach

- No database migration added.
- No seed changes.
- No authentication/security flow changed.
- No checkout/order API contract changed.
- No CMS schema or stored Hero data changed.
- Existing admin routes and functionality were left intact.
- Existing no-native-alert/confirm/prompt rule remains covered by QA.

## QA performed in this workspace

- Syntax transpilation check passed for all changed TS/TSX files.
- Updated integrity suite passed all checks, including the new mobile drawer, Wishlist, Compare, badge, Hero, Filter Drawer and toast-overlap checks.
- Full `npm run lint` / `npm run build` were not executed in this sandbox because the generated package intentionally excludes `node_modules` and internet/package installation is unavailable here. Run them locally after `npm install`.

## Recommended local verification

Run:

```cmd
npm install
npm run lint
npm run build
npm run qa:integrity
npm run dev
```

Then test 320, 360, 375, 390, 414, 430, 768, 1024, 1280 and 1440+ widths. Pay special attention to the mobile drawer accordion expansion, Wishlist header count, Cart badge, Compare actions, Wishlist rollback/toasts, Hero image cropping, Hero slide behavior, Vehicle Finder and bottom-dock overlap.
