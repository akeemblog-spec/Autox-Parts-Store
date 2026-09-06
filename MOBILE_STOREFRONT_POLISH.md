# AutoX Mobile Storefront Polish

This pass keeps the existing database schema and APIs intact and focuses on storefront/mobile behavior.

## Included
- Mobile product grids default to two columns with a 2-column / 1-column switch.
- Product fetching is paged (16 items per request) with a Load More action to reduce initial payload.
- Product thumbnails use browser lazy-loading/async decoding.
- Footer Top Brands is limited to the first five active/sorted brands.
- Main category navigation is desktop-only; mobile categories are integrated into the side drawer.
- Mobile drawer now sits above all storefront navigation layers and locks body scrolling.
- Bikes, Three Wheelers and All Categories are collapsed accordions in the mobile drawer instead of permanently expanded lists.
- Desktop account/profile dropdown now stacks above the category/main-navigation layer.
- Installment CTA text is shortened to `Installment` while retaining its icon.
- Hero slide pagination moves above the mobile feature grid.
- Popular-model cards are smaller on mobile and use a thin AutoX-red draggable scrollbar thumb.
- Homepage category cards are more compact and integrated on mobile.
- Search starts after 3 characters, debounces requests, shows live product suggestions, supports category filtering on desktop, and opens the matching filtered products page.
- `/api/products` now supports `q`, `limit` and `offset` for search and incremental loading.

## No migration
No database migration or reseed is required for this pass.
