# AutoX v4.3 — supplied red bike in neon garage

Builds on AutoX v4.2, replacing only its fixed hero artwork and corresponding paths.

- Used the user-provided red Ducati/Panigale-style bike as the visual subject for new generated garage composites. The chosen landscape composition increases bike scale and integrates wheel contact, garage lighting and wet-floor reflections while preserving a quiet left text area.
- Added desktop, middle-width and mobile WebP variants with distinct filenames to avoid old cached artwork.
- Updated responsive picture sources in the homepage Hero and the fixed slide image paths stored when editing Admin storefront slides.
- Tightened the text width at 1024–1279px so it remains separate from the larger motorcycle. Slide headline, body, action links, indicators, swipe, autoplay, and trust section behavior are unchanged.
- Preserved prior v4.2 files for compatibility; old fixed artwork is no longer referenced by the Hero.

QA: all three WebP assets decode and source checks confirm responsive image routing and existing live slide text/CTA transitions. Full npm lint/build and browser layout verification could not run due missing cached packages and unavailable npm registry; run npm ci, npm run lint, npm run build and inspect 390px, 1024px and 1440px viewports before publishing.
