# AutoX Admin + Storefront UX Upgrade — 2026-09-14

Implemented on top of the v3 mobile installment-fix package.

## Storefront
- Replaced the generic WhatsApp footer icon with a dedicated WhatsApp glyph.
- Added a reusable premium `StandardPageHero` matching the About/FAQ visual language.
- Applied the standard hero/breadcrumb treatment to Contact, Offers, Parts Finder, Categories, All Parts, Bikes, Three Wheelers and Services.
- Brand-detail heroes remain intentionally separate.
- Refined the desktop-only My Account sidebar active/inactive tab styling without changing routes or mobile navigation.

## Admin live UX
- Added `AdminLiveProvider` with lightweight 12-second background refresh while the Admin tab is visible.
- Immediate refresh also runs when the browser tab regains focus/visibility.
- Detects changes for orders, customer messages, returns, reviews and low-stock state.
- Uses Next.js `router.refresh()` for relevant Admin routes, so the browser does not perform a full page reload.
- Notification bell content now shares the same live refresh layer.
- Sidebar unread/count badges were intentionally not added/expanded in this pass.

## Admin feedback / safety
- Upgraded shared AutoX toast styling for success, error, warning and info feedback.
- Existing reusable confirmation dialog remains the destructive-action path; no native browser `alert()` / `confirm()` calls are used in Admin components.
- Added/standardized success/error feedback across settings, storefront, catalog, coupons, inventory, messages, reviews, returns, products, payment methods, admin accounts and order status updates.
- Order status updates use optimistic UI with rollback on server failure.
- Payment-method toggles already use optimistic UI and now provide toast feedback.

## Dashboard / orders
- Dashboard KPI cards are now clickable and navigate to the relevant Admin area.
- Added an Admin Activity feed inside the order drawer, backed by the existing `admin_audit_logs` table. No new migration is required.
- Activity shows the action, actor and timestamp for recorded order admin changes.

## Responsive Admin polish
- Tightened mobile Admin shell/header spacing.
- Admin global search becomes available from small-tablet widths.
- Existing mobile drawer and horizontal table overflow behavior are preserved.

## QA notes
- A TypeScript parser pass over the changed TS/TSX files found no syntax-level TypeScript/JSX errors.
- Native Admin `alert()`/`window.confirm()` usage scan: none found.
- Full dependency-based lint/build was not runnable in the artifact environment because npm package installation could not complete from the package registry. Run `npm install`, `npm run lint`, and `npm run build` locally or in Vercel before production acceptance.
