# AutoX Security + MFA + Super Admin Upgrade

This build upgrades the working `AutoX UI + QA Updated` version with the security changes discussed in the audit and a complete Super Admin account-management flow.

## Implemented

- Mandatory TOTP MFA for `admin` and `super_admin` accounts.
- Compatible with Google Authenticator, Microsoft Authenticator, Authy, 1Password and other standard TOTP apps.
- MFA setup uses a local setup key / `otpauth://` link so the MFA secret is not sent to a third-party QR service.
- 10 one-time recovery codes; only SHA-256 hashes are stored.
- MFA secrets are AES-256-GCM encrypted at rest with `MFA_ENCRYPTION_KEY` (falls back to `AUTH_SECRET` only if needed).
- MFA proof is an HttpOnly, SameSite=Lax signed cookie bound to the exact Auth.js login session nonce and session version.
- Super Admin can invite Store Admins without creating or knowing their passwords.
- Admin invitation email expires after 24 hours and is one-time use.
- Admin invitation statuses: Invited, MFA Setup Required, Active, Disabled, Invite Revoked.
- Super Admin can resend/revoke invitations, activate/deactivate admins, send password reset, reset MFA, edit names and delete Store Admins.
- Deactivation, password reset and MFA reset invalidate existing sessions using `session_version`.
- Central DB-backed authorization is used for admin decisions. The stale-JWT Admin Accounts page bug is removed.
- `/api/orders/[id]` no longer trusts a stale JWT admin role when reading another customer's order.
- DB-backed rate limiting for login, registration, verification resend, password reset, MFA, and admin invite operations.
- Verification/reset/invite links use trusted `APP_URL` instead of the incoming request Host header.
- One-time auth token consumption is atomic (`DELETE ... RETURNING`) and expiry is checked in the same operation.
- Security activity log for privileged actions. Super Admin UI: `/admin/security`.
- Admin account actions, order-status updates, product updates/deletes, and payment setting changes write audit records.
- Payment provider config is hidden from ordinary Admin API responses; changing provider config requires Super Admin.
- Image upload validates both reported MIME type and file magic bytes, keeps 5 MB limit and server-generated names.
- Added baseline security headers: HSTS in production, frame denial, nosniff, strict referrer policy, permissions policy, COOP.
- Restricted Next Image remote hosts instead of allowing every HTTPS host.
- Removed hard-coded seed password behavior. Development seeding now requires explicit opt-in and a 12+ character password from env.
- Registration error text is less useful for account enumeration.
- Customer password minimum is 10 characters; invited Admin password minimum is 12 characters.
- Resend failures are handled more clearly for new registrations/admin invitations.
- ESLint configuration updated for ESLint 9 / Next.js 16.

## Required environment variables

Add these to `.env.local` (do not commit the file):

```env
APP_URL="http://localhost:3000"
AUTH_SECRET="YOUR_EXISTING_STRONG_AUTH_SECRET"
MFA_ENCRYPTION_KEY="A_NEW_LONG_RANDOM_SECRET"
MFA_PROOF_SECRET="A_DIFFERENT_NEW_LONG_RANDOM_SECRET"
RESEND_API_KEY="re_..."
EMAIL_FROM="AutoX Parts Store <onboarding@resend.dev>"
```

Generate the two MFA secrets on Windows/Node with:

```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Run it twice and use a different value for each key.

For production, change `APP_URL` to your real HTTPS site URL and use a verified Resend sending domain.

## Database upgrade

Run once against the same database used by `.env.local`:

```cmd
npm install
npm run db:migrate
npm run db:promote-super-admin
```

Do **not** run `npm run db:seed` on your existing populated Supabase database.

Migration added: `0005_security_mfa_admin_invites.sql`.

## First Super Admin login after upgrade

1. Sign in using the existing Super Admin password.
2. AutoX redirects to `/mfa/setup`.
3. In Google Authenticator or Microsoft Authenticator, add an account using the displayed setup key. You can also use the `Open in authenticator app` link on a compatible device.
4. Enter the current 6-digit code.
5. Save the 10 recovery codes in a password manager/offline safe location.
6. Continue to `/admin`.

## Creating a Store Admin

1. Super Admin opens **Admin Accounts**.
2. Enter the person's full name and email.
3. Click **Send Invite**.
4. The new Admin receives a 24-hour one-time setup link.
5. They create their own 12+ character password.
6. They sign in and must configure authenticator MFA before `/admin` is accessible.

The Super Admin never sees or creates the Admin's password.

## QA performed in this environment

- `tsc --noEmit`: PASS (0 TypeScript errors).
- ESLint 9 / Next.js rules: PASS with 0 errors. Existing `<img>` optimization warnings remain and do not block execution.
- Static security scans found no remaining `req.nextUrl.origin` usage for auth links and no stale `session.user.role` authorization checks in application routes.
- Production `next build` was attempted. It reached Next.js 16.3.4 but the sandbox could not download the Linux SWC package because `registry.npmjs.org` DNS/network access is blocked (`EAI_AGAIN`). This is an environment/network limitation, not a TypeScript build error.

## Deployment-only recommendations still applicable

Code cannot enforce every infrastructure control. Before public production launch also use a least-privilege PostgreSQL application role, HTTPS-only deployment, verified Resend domain, protected deployment secrets, database backups, dependency vulnerability scans (`npm audit`) with live registry access, and MFA recovery procedures for the sole Super Admin.
