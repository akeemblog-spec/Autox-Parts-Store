# AutoX approved enhancements — 2026-09-06

Hero design was intentionally left unchanged. The user also explicitly excluded the Dashboard "Needs Attention" card section and real payment gateway integrations from this phase.

## Implemented
- Coupon/discount system: Admin coupon manager, percentage/fixed discounts, start/expiry support, minimum order, max discount, global/per-customer limits, server-side checkout validation, order discount snapshot, usage ledger.
- Verified-purchase reviews: only delivered-order purchasers can submit; one review/customer/product; pending moderation; Admin approve/reject; approved reviews recalculate product rating/count; approved reviews render on product detail.
- Inventory movement history foundation: order deductions, cancellation/approved-return restoration, manual Admin adjustments with reason and actor, low-stock attention count/notification.
- Branded order email notifications: order confirmation plus Admin-driven status updates using the existing Resend email layer.
- Returns/cancellations: customer request action in My Orders; Admin Returns area; approve/reject; refund-status field; first approval restores stock and prevents duplicate restoration.
- Admin sidebar attention badges: Pending Orders, Pending Reviews, Unread Messages, Pending Returns, Low Stock Products, and Super Admin account setup issues. Counts represent action required, not total records.
- Admin notification bell: new order, review, message, return/cancellation, and low-stock notifications with unread state and deep links.
- Customer Messages: separate read/unread and resolved/open state.
- Persistent storefront layout: public store routes now live under the `(storefront)` route group. TopBar/Header/MainNavigation/Footer are owned by one shared layout instead of each page, preserving URLs while preventing chrome remounts between storefront routes.
- Repeatable QA smoke script: `npm run qa:smoke` checks core public routes and protected API boundaries against a running dev server.
- Blog remains removed.

## Deliberately not published without owner content
Policy/legal pages (Shipping, Returns, Warranty, Privacy, Terms) need the actual AutoX business/legal text. No invented policy text was published. The routes can be added once the owner supplies/approves the content.

## Image/performance review
The persistent layout removes a larger source of repeated storefront work. Existing dynamic/admin `<img>` elements were not blindly converted to `next/image`; ESLint still reports 22 image-optimization recommendations and 0 errors. Convert those selectively once all production image hosts and sizing rules are finalized.

## Migration
Run `0007_operations_enhancements.sql` via `npm run db:migrate`.

## QA
- `npx tsc --noEmit`: PASS, 0 errors.
- ESLint: PASS, 0 errors, 22 existing image optimization warnings.
- Static scan: no Blog references in app/components/lib/db; storefront chrome duplication removed from individual public pages/components.
- `npm run qa:smoke` is intended to run locally while `npm run dev` is running because this sandbox is not connected to the user's Supabase/Resend environment.
