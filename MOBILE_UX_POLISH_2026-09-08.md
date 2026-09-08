# AutoX Mobile UX Polish — QA Hotfix — 2026-09-08

## Implemented

- Added a modern floating mobile storefront dock with exactly five primary actions: Home, Categories, Search, Account, and Cart.
- Added AutoX red active-route styling, live cart count, iPhone safe-area handling, and mobile bottom spacing so the dock does not cover page content.
- Added a live CMS/database-backed Categories bottom sheet.
- Added a dedicated mobile Search bottom sheet that reuses the existing live AutoX product search and autofocuses the search input.
- Account action is authentication-aware: signed-in users go to My Account; signed-out users go to Login.
- Added a reusable mobile My Account navigation selector across account routes instead of the previous squeezed mobile account grid.
- Simplified duplicate mobile navigation while preserving desktop header behavior.
- Corrected the desktop account dropdown label from “My Orders” to “My Account”.
- Added storefront and account route skeleton loading states.
- Added AutoX favicon/browser identity: favicon.ico, SVG app icon, Apple touch icon, manifest, and metadata wiring.
- Updated `.env.example` with Gmail SMTP placeholders only; no runtime secrets are included.
- Kept the existing Hero/homepage layout unchanged in this pass, as requested.

## Lint hotfix

The first mobile-nav package exposed two React ESLint errors in `MobileFloatingNav.tsx` caused by synchronous state updates inside effects.

They are now fixed properly rather than suppressed:

- Removed the pathname effect that synchronously called `setPanel(null)`.
- Removed the logout effect reset `setCartCount(0)` and derive the visible cart count from authentication state instead.
- Existing panel-close behavior remains attached to explicit links, search navigation, close controls, backdrop click, and Escape.

## QA completed

- `npm run lint`: PASS with **0 errors**. There are 22 existing `@next/next/no-img-element` performance warnings elsewhere in the project; these are non-blocking and were not hidden or suppressed.
- TypeScript `--noEmit` source check: PASS. The isolated Linux QA environment reused the original Windows dependency tree because the package registry was unavailable; a temporary QA-only Nodemailer type shim was used for this check and was removed afterward.
- Repository integrity/static regression suite: **86/86 PASS**, including routes, admin pagination, cart safeguards, product archive safeguards, no native browser alert/confirm/prompt dialogs, migrations, mobile dock items, live categories, real search integration, authentication-aware Account routing, live Cart update event, Account mobile navigation, loaders, favicon/icons, and manifest.
- Added the new mobile UX assertions to `scripts/qa-integrity.ts` so future local runs also guard this functionality.
- The changed MobileFloatingNav no longer triggers `react-hooks/set-state-in-effect`.
- No `.env.local`, Gmail App Password, database credentials, or other private runtime secrets are included in the final ZIP.

## Build/runtime environment note

A full Linux `next build` could not complete inside this sandbox because Next.js attempted to download the Linux SWC binary from `registry.npmjs.org`, and external package-registry DNS was unavailable. The borrowed dependency folder contains Windows-native binaries, so `qa:smoke` also cannot execute in this Linux container. This is an environment/platform limitation rather than a source-code failure.

On the user's Windows machine, run the normal fresh dependency install and then the full checks below. The previous user-side `npm install` already completed successfully.

```cmd
npm run lint
npm run build
npm run qa:integrity
npm run dev
```

Then visually test at 320px, 375px, 390px, 430px, and tablet widths: Home, Categories sheet, Search/results, product pages, Cart badge updates, Login/Account behavior, account sub-navigation, Orders, Addresses, Profile, Settings, Track Order, footer spacing, and overlay stacking.
