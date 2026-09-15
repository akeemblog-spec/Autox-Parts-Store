# AutoX v4.1 — sidebar badges, social icon and log review (2026-09-15)

Based on the September 14 v4 Admin Live UX archive.

- Restored Orders, Products (low stock), Reviews, Messages, Returns and Super Admin Accounts attention badges to both desktop and mobile Admin navigation. All use the existing AdminLiveProvider refresh shared by the notification bell: every 12 seconds while the tab is visible, plus refresh on focus/visibility.
- Changed the WhatsApp footer glyph to an outlined 14px icon using the same SVG size, stroke color and surrounding 32px circle as the other social buttons.
- Failed Admin attention-count or notification requests now preserve the last successful display instead of silently setting counts to zero. Failure to mark a notification as read restores its server state and shows an error message.
- Added an accessible label to the mobile Admin menu close button.

Log review: all sampled Admin GET/PATCH calls returned HTTP 200. React instrumentation error originates in a chrome-extension installHook.js stack, outside application code. Auth.js CredentialsSignin occurs after failed login attempts; login authorize returns null for invalid email/password, inactive or unverified account, or after 5 attempts within 15 minutes. The log alone cannot distinguish these causes.

QA: project archive source and changed-file consistency checks completed. Full dependency-based lint/build and connected DB flow checks remain unverified because the npm cache lacks dependencies and network registry access is unavailable. Run npm ci, npm run lint, npm run build, and npm run qa:integrity in a network-enabled project environment, then test a new order/message and the icon in a browser.
