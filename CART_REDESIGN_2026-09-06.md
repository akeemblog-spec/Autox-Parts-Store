# AutoX Cart / Checkout Redesign — 2026-09-06

## Scope
- Hero section intentionally unchanged.
- Redesigned only the customer cart/checkout experience while preserving the existing AutoX black/charcoal/red design language.
- Existing checkout APIs, coupon validation, stock validation, delivery fees, addresses, payment methods, inventory deductions, order creation and email flows remain intact.

## UI / UX changes
- Larger, clearer product rows with unit price, quantity control and item total hierarchy.
- Custom AutoX confirmation modal before cart removal; no browser confirm dialog.
- Three-stage visual checkout hierarchy: Cart, Delivery, Payment.
- Saved addresses can be selected directly in checkout; editing a field switches to a custom address.
- Standard and Express delivery are presented as consistent selectable cards.
- Payment methods use consistent cards and selection indicators.
- Coupon area moved into the Order Summary and supports Enter-to-apply.
- Desktop Order Summary is sticky; mobile naturally stacks below checkout content.
- Summary clearly separates subtotal, standard delivery, express priority fee, coupon discount and final total.
- Added restrained secure-checkout / stock-revalidation reassurance blocks.
- Focus styles use a single AutoX red border, consistent with the prior UI QA pass.

## Responsive behavior
- Desktop: checkout content + sticky summary.
- Tablet/mobile: sections stack, product rows adapt without compressing desktop columns, and summary becomes part of normal document flow.

## QA intent
- No schema or migration change required by this redesign.
- Run TypeScript, ESLint, qa:integrity, and live qa:smoke after installing dependencies.
