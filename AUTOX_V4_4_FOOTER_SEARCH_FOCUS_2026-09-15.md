# AutoX v4.4 — footer mobile layout and search focus

Built on the v4.3 neon garage with user-supplied bike.

- Removed the Customer Support title and the support description; Customer Care links remain.
- Top Brands and Customer Care now occupy the same two-column mobile row, like Quick Links and More. The desktop footer remains five columns. Customer Care link typography and spacing now match the other footer groups.
- Search input/category/button focus has one clear form-level red border/ring. Inner keyboard outlines are suppressed only for controls within this search bar, preventing clipping next to the search icon. Disabled button stays close to its active red color rather than fading the whole button.

Static source checks verified group layout, removal of unwanted copy, scoped focus selector and consistent search button state. Full npm build/lint and browser visual checks were unavailable without cached npm packages; run npm ci, npm run lint, npm run build and inspect 360px mobile search/footer locally.
