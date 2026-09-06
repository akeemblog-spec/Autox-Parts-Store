# AutoX Parts Store — Enhancement Pass

This build starts from the previously stabilized Next.js 16 version and adds a stronger admin/catalog/checkout workflow.

## Added / improved

- Full Admin → Products manager with Add Product and full Edit Product modal.
- Admin-managed product fields: name, slug, brand, category, vehicle type, model years, part type, price, previous price, discount, stock, genuine flag, installment flag, description, warranty and delivery estimate.
- Multiple product images with URL entry and local file upload (JPG/PNG/WEBP/GIF, max 5 MB).
- Multiple vehicle compatibility / fitment rows per product.
- Multiple product specification rows per product.
- Product create/update operations save the product and related images/fitment/specifications in a database transaction.
- Buy Now now adds the selected quantity and opens the cart checkout flow.
- Cart checkout now asks for real delivery address, city, district, postal code and phone instead of using a hard-coded demo address.
- Checkout revalidates stock in the database and decrements stock inside the same database transaction as order creation.
- Existing Next.js 16 async dynamic-route fixes, cart/wishlist wiring, header refresh events and filter normalization are retained.

## Validation performed

- `tsc --noEmit` passes with no TypeScript errors.
- Dynamic App Router source was checked for remaining direct `params.id` / `params.slug` style access.
- A Next.js production build was started, but this Linux sandbox cannot download the required Linux SWC package because outbound npm access is unavailable. Run `npm run build` on your Windows machine after `npm install` for the final platform-specific production build.

## Important image-upload note

The included file uploader writes images into `public/uploads/products`. This is appropriate for your current local Windows setup and for traditional persistent Node hosting. Serverless hosts such as Vercel do not provide durable local filesystem storage, so before production deployment you should replace this upload endpoint with persistent object/media storage such as Cloudinary, S3/R2, Supabase Storage or Vercel Blob. Image URL entry remains available in the admin form.

## Database

No schema migration is required for this enhancement pass. It uses the existing `products`, `product_images`, `product_compatibility`, `product_specifications`, `addresses`, `orders`, `order_items` and cart tables.

Use your existing `.env.local` and existing Neon database. Do not seed again unless you intentionally want the seed routine to run.
