# AutoX v4.2 — fixed neon garage hero

Built on AutoX v4.1 live badges/WhatsApp fix.

## Homepage
- Created separate desktop (1983×793) and mobile (941×1672) compressed WebP artwork of the existing loader red sportbike integrated into a red neon garage. The imagery stays fixed and contains no text.
- Rebuilt the homepage Hero so only slide eyebrow, headline, description and action links fade between active storefront slides. Indicators, desktop arrows, mobile swipe, autoplay and hover pause remain.
- Trust details remain static. Hero media no longer follows individual admin slide image URLs.
- Removed per-slide hero image upload/input controls from the Admin storefront editor, and saved new/edited slides with the fixed artwork paths to meet the existing database image requirement. The banner image controls remain unchanged.

## Polish
- Added padding in the horizontal carousel so the lifted brand and three-wheeler cards show their full top border on hover.
- Simplified the WhatsApp drawing and resized all footer social glyphs consistently to 18px in 36px circular buttons.

## Checks and limits
- Both WebP files decode and source checks verify fixed picture, live slide content/links, indicator and swipe controls, fades, admin editor image behavior, hover clearance, and shared social icon sizing.
- Full npm lint/build and live browser/database verification could not run in this environment because the npm cache lacks a required dependency and registry access is unavailable. Run npm ci, npm run lint, npm run build, and a desktop/mobile hero review in a network-enabled local or CI environment before publishing.
