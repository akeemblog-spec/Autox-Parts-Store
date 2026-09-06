# AutoX UI + QA Update

## Feature benefit cards
The hero benefit cards were redesigned for a cleaner AutoX look on desktop and mobile:
- stronger icon containers and spacing
- consistent title/subtitle hierarchy
- subtle red accent and hover treatment
- 2 × 2 compact mobile layout instead of a tall four-row stack
- improved wrapping for Islandwide Delivery and Hassle-Free Returns
- additional desktop-only helper copy at extra-large widths

## Database migration reliability fix
The previous migration sequence added the `super_admin` enum value and then attempted to use the new enum value during the same migration run. PostgreSQL can reject use of a newly-added enum value until the transaction commits. The automatic role promotion was therefore removed from `0004_delivery_auth_accounts.sql`.

Run database updates in this order:

```bash
npm run db:migrate
npm run db:promote-super-admin
```

`db:promote-super-admin` is seedless. It does not create products, orders, customers, brands, or demo content. If a Super Admin already exists it exits without changing anything; otherwise it promotes the oldest existing Admin account.

Do not run `npm run db:seed` on an existing populated production/Supabase database.

## QA completed
- TypeScript: `tsc --noEmit` passes with zero errors.
- Checked the hero feature-card implementation for responsive desktop/mobile rendering and text wrapping.
- Checked the Super Admin migration flow so schema changes can commit before role promotion.
- Existing database data is not deleted by these changes.
- A full Next.js production build was attempted; the sandbox could not download the Linux SWC package from npm because outbound package-registry network access is unavailable. The failure occurred before application compilation and is environment-related, not a TypeScript/application error.
