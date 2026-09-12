# AutoX Bike Preloader Integration — 2026-09-11

## Base verified
This build is based on the user-provided `autox-parts-store-modern-ui-v4` project, not the older `order-track-account-hero-loader-ui-hotfix-v2` archive.

The two project versions are not identical. The modern-ui-v4 source contains additional and modified UI work, so replacing it with the older archive would roll back newer changes.

## Loader integration
- Replaced the previous SVG-style homepage launch bike with the supplied red superbike PNG.
- Added layered rotating technical rings, reverse/fine rings, red ambient glow, particles, speed streaks, ground reflection, progress percentage, AutoX wordmark and smooth homepage reveal.
- Uses the exact supplied PNG at `public/images/ui/autox-loader-bike.png`.
- Preserves the existing `HomeLaunchExperience` wrapper and homepage flow.
- Adds `components/HomeLaunchExperience.module.css` for isolated loader styling.
- No database, CMS, authentication, cart, order, admin or API behavior changed.

## Verification
- Exact bike image SHA-256 verified against the supplied PNG.
- PNG verified as 1254x1254 RGBA.
- Existing AutoX integrity suite was executed against the updated v4 source and all checks passed.
- Package excludes `.env.local`, `.git`, `.next`, `node_modules` and `tsconfig.tsbuildinfo`.

## Local verification commands
```cmd
npm install
npm run lint
npm run build
npm run qa:integrity
npm run dev
```
