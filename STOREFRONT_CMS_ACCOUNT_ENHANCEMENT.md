# AutoX Storefront CMS + Account/Tracking Enhancement

## Implemented

### Homepage / Storefront CMS
- Database-backed multi-slide Hero manager.
- Multiple active hero images automatically become a slider.
- Animated active pagination/progress bar.
- Admin Hero autoplay ON/OFF, interval and pause-on-hover controls.
- Desktop + optional mobile hero images.
- Hero text and CTA fields managed in Admin.
- Database-backed promo banners for Easy Installment Plans / Genuine Parts sections.
- Footer copyright and bottom message editable from Admin.
- Social URLs (Facebook, Instagram, YouTube, TikTok, WhatsApp, X) editable; blank URLs stay hidden.

### Catalog Admin
- New Admin > Catalog page.
- CRUD for Brands, Categories, Vehicle Types and Part Types.
- Brand logo, card/vehicle image and cover/hero image fields.
- Brand cover automatically used by brand hero; brand card uses managed imagery.
- Category card/cover image, icon, description, active state and sort order.
- Managed Vehicle/Part Types feed the Admin product form.
- Public part-type filters load active types from the database.
- Category and brand counts use real product counts instead of static mock totals.
- Disabled catalog items are hidden from normal storefront lists.

### Orders / Account
- New order status history table.
- Checkout records Order Placed timestamp automatically.
- Admin order status changes append timestamped history entries.
- Added Out for Delivery order status.
- Shared timeline component is used by My Orders and Track Order, so dates/times are consistent.
- Track Order shows a date/time for every status stage that has actually occurred.
- Tracking Updates uses the same saved status history.
- Account latest-order status badge is positioned above the price.
- New My Orders page with past order list and responsive order timelines.
- New Addresses page with Add/Edit/Delete/Default controls.
- New Profile Details page for name/phone; email is intentionally read-only because it is the login identity.
- New Settings page with persisted notification preferences and corrected toggle styling.

### Safety / compatibility
- Existing users/products/orders are not dropped or recreated.
- Schema migration is additive except vehicle_type/part_type columns are safely converted from PostgreSQL enums to text so Admin-created taxonomy values can be used without code changes.
- Existing enum values remain unchanged as text values.
- Existing Supabase/PostgreSQL DATABASE_URL continues to be used.
- No seed is required.

## One-time database step for this version
After copying your existing `.env.local` into this project:

```cmd
npm install
npm run db:migrate
npm run dev
```

Do NOT run `npm run db:seed` on an existing populated database.

## Recommended local QA
1. Admin > Catalog: create/edit a brand with logo/card/cover images.
2. Confirm home brand card and brand hero use the managed images.
3. Create a new category and verify its product count is real.
4. Add a Vehicle Type / Part Type and verify it appears in Add Product.
5. Admin > Storefront: create 2+ active hero slides and verify slider + pagination animation.
6. Turn Hero autoplay OFF and verify slide remains manual.
7. Edit both promo banner backgrounds and footer/social data.
8. Place a test order.
9. Admin > Orders: move it through processing, shipped, out_for_delivery, delivered at different times.
10. Compare My Orders and Track Order: the stage timestamps must match.
11. Test Account > Addresses, Profile Details and Settings on desktop and mobile.
12. Run `npm run build` locally before deployment.

## Image storage note
This upgrade intentionally preserves the project's existing image-upload mechanism (`public/uploads/...`) so it does not introduce a new Supabase Storage dependency unexpectedly. This is fine for local/persistent-server hosting. For Vercel/serverless production, move uploads to Supabase Storage or another object store before launch.
