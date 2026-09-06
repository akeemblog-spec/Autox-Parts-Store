# AutoX Delivery, Email Auth & Super Admin Update

## Added
- Admin-managed Standard Delivery Fee and Express Delivery extra fee.
- Express checkout option calculated as Standard Delivery + Express Delivery Fee.
- Delivery method/fee snapshots saved with each order and visible in Admin order details.
- Branded AutoX verification and password-reset emails sharing one reusable email layout.
- Email verification for new customer registrations. Existing accounts are marked verified by the migration to avoid breaking current users.
- Forgot Password / Reset Password for customers, Store Admins and Super Admins.
- Super Admin role with Store Admin account management: create, edit, activate/deactivate, send password reset, delete.
- Protected Admin APIs re-check account status from the database, so deactivation takes effect immediately.

## Email provider
Transactional email uses Resend's HTTPS API without adding another npm package. Add these to `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxx
EMAIL_FROM=AutoX Parts Store <noreply@your-verified-domain.com>
```

In Admin > Settings > Store Settings, set **Email logo URL** to an absolute, publicly accessible logo URL. If it is blank, the email uses the AutoX text wordmark fallback.

## Database migration
This release includes two additive migrations:
- `0003_super_admin_role.sql`
- `0004_delivery_auth_accounts.sql`

Run once against your existing Supabase database:

```bash
npm run db:migrate
```

Do not run the seed against an already populated production database.

The first existing Store Admin (oldest admin account) is promoted to `super_admin` by the migration so there is a safe initial Super Admin account. Existing customers/orders/products are not deleted or recreated.

## QA checklist
1. Run migrations, then sign in with the existing admin and confirm **Admin Accounts** appears.
2. Create a temporary Store Admin, sign in, then deactivate it from Super Admin and confirm Admin access is denied.
3. Register a new customer and confirm the branded verification email arrives; verify and sign in.
4. Use Forgot Password and confirm the reset email matches the verification email design.
5. In Admin > Settings > Shipping, set Standard and Express fees.
6. In Cart select Standard and Express; confirm Express total = standard fee + express surcharge.
7. Place an Express order and confirm Admin order details identify Express / same-day dispatch and preserve the fee breakdown.
