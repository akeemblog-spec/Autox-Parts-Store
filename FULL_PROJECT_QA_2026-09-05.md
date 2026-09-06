# AutoX Full Project QA & Functional Cleanup

Date: 2026-09-05

This pass was performed on the Security + MFA + Navigation Hotfix build. It focuses on broken or incomplete existing functionality, data integrity, stale-session safety, storefront/admin consistency, and dead-code cleanup. Optional product features were not silently added; they are listed separately below for approval.

## Fixed / completed in this QA pass

### Address book duplication
- Root cause: checkout created a new `addresses` record on every order and the Account address book treated those immutable order snapshots as saved addresses.
- Added `addresses.is_saved`.
- Checkout snapshots are now `is_saved = false` and never appear in the saved address book.
- Existing addresses referenced by historical orders are migrated to snapshot-only records.
- Address GET/PATCH/DELETE only operates on saved addresses.
- Added a database partial unique index so one customer can have at most one saved default address.

### Wishlist / compare data integrity
- Fixed wishlist UI remove behavior that previously could re-add an item on the server.
- Added unique user/product constraints for wishlist and compare lists.
- Migration cleans historical duplicates before adding those constraints.
- Insert routes are idempotent under duplicate requests.
- Compare now uses the database instead of mock/static product data and supports up to four products.

### Customer Parts Finder
- Repaired the non-working model selector and Search button.
- Vehicle type -> brand -> model -> year selection now uses live catalog data.
- Product filtering now accepts model/year fitment criteria.
- Popular-search actions navigate to real product results.
- Removed the fake AI image-identification/upload UI rather than advertising a capability that did not exist.
- Added Vehicle Models to Admin > Catalog so the finder is maintainable without code changes.

### Product filtering
- Fixed multiple-category filtering: selected category checkboxes are now all honored by the products API instead of only one category being read.
- Brand, vehicle type, model, year and search query can be combined.

### Super Admin / Admin search
- Replaced the visual-only admin search field with a protected real search endpoint.
- Searches orders, products and customers.
- Added usable results dropdown and first-result navigation.
- Customer page also supports `?q=` name/email/phone search.

### Contact / customer messages
- The public Contact form previously had UI but no submit behavior.
- Added validated and rate-limited message submission.
- Added Admin > Messages to view and resolve/reopen customer messages.
- Sensitive actions are protected by existing Admin authorization and audit logging.

### Offers / services / fake actions
- Offers now comes from live active promo banners and real discounted products instead of mock/static product data.
- Services page no longer advertises fake AI identification or a non-working Book Service button.
- Dead installment buttons were converted to informational availability labels.
- Removed the fake footer newsletter form because no newsletter backend existed.
- Removed footer links to legal pages that did not exist; policy pages should only be added when real store/legal policy text is supplied.

### Blog removal
- Removed the entire blog route.
- Removed all Blog navigation/footer/data references.
- Source scan confirms no remaining Blog route references in application code.

### Session and cart reliability
- Account Orders/Profile/Settings now reject invalidated security-upgrade sessions consistently.
- Cart quantity updates now roll back the UI and show the real API/stock error if the server rejects the change.
- Cart item removal also rolls back if the API fails.

### Catalog administration
- Admin Catalog now manages Brands, Categories, Vehicle Types, Vehicle Models and Part Types.
- Vehicle Models include brand, model name/slug, image and year range.
- Brand deletion is blocked while referenced by products/models.

## QA checks performed

- TypeScript (`tsc --noEmit`): PASS, 0 errors.
- ESLint: PASS with 0 errors. Remaining warnings are primarily existing `<img>` performance recommendations.
- Static internal-link route scan: no missing literal internal route targets detected after cleanup.
- Blog reference scan: no application-code Blog references remain.
- Mock/static product usage review: production Offers/Compare flows no longer depend on mock product arrays.
- Dead-button scan: remaining handler-less buttons are native form submit buttons, not discovered dead actions.
- Production build was attempted. It reached Next.js build startup but the isolated QA environment could not download `@next/swc-linux-x64-gnu` because `registry.npmjs.org` DNS/network access failed (`EAI_AGAIN`). This is an environment limitation, not an application TypeScript error.

## Important environment limitation

This QA environment intentionally does not contain the user's private `.env.local`, Supabase credentials, Resend key, or real payment provider credentials. Therefore live end-to-end writes against the user's actual Supabase database, delivery of real emails, and real payment-provider transactions were not executed here. The code was statically/type checked and the routes/business logic were reviewed, but a final staging smoke test against the user's configured services is still required before production launch.

## Recommended enhancements NOT added without approval

1. **Real payment gateway integrations and webhooks** — Card/Koko/Mintpay settings exist, but a production store should have provider-specific server verification, signed webhooks, idempotent payment events, and payment/refund status history before advertising online payment as complete.
2. **Coupon management and checkout redemption** — a coupons table exists but there is no customer coupon flow or Admin coupon manager. Implement validation, usage limits, date windows and immutable discount snapshots on orders.
3. **Customer review submission + moderation** — Reviews can be displayed/admin-viewed, but customers need an authenticated verified-purchase review flow, editing limits and moderation/visibility controls.
4. **Returns/refunds/cancellations workflow** — add customer request flow, Admin decision/status history, inventory restoration rules and payment refund integration.
5. **Inventory movement ledger** — keep immutable stock adjustment reasons (order, cancellation, manual correction, restock) instead of relying only on the current stock number.
6. **Order notifications** — branded order confirmation/status emails/SMS/WhatsApp if desired, driven from status history and sent idempotently.
7. **Persistent storefront layout** — move Header/MainNavigation/Footer into a shared storefront layout so they do not remount on each storefront route. The current cache reduces repeated fetching, but a shared layout is the cleaner Next.js architecture.
8. **Image optimization** — replace remaining raw `<img>` elements with `next/image` where compatible. ESLint currently flags these as performance warnings, not runtime failures.
9. **Legal/store policy pages** — Shipping, Returns, Privacy and Terms should be added using actual business-approved content rather than placeholder legal text.
10. **Automated regression suite** — add Playwright end-to-end tests for registration/verification, MFA, Super Admin invites, catalog search, parts finder, wishlist/cart/checkout, addresses, order tracking and Admin order operations; add API/unit tests for security and pricing rules.
11. **Admin global-search deep links** — search is now functional, but order/product results could be enhanced to open the exact order drawer or product editor directly instead of navigating to the containing management page.
12. **Dependency/security CI** — run `npm audit`/dependency review in CI with network access, plus migration/type/lint/build checks on every deployment.

## Migration required

This build includes `db/migrations/0006_full_qa_cleanup.sql`. Run `npm run db:migrate` once before testing this build. Do not run `npm run db:seed` against an existing populated database.
