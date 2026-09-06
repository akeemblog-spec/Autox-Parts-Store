# Navigation + Session Hotfix

This hotfix addresses the storefront errors seen when navigating between menu/category pages.

## Fixed
- Invalidated Auth.js JWTs no longer expose an empty string as `session.user.id`.
- Cart, wishlist, order and storefront client actions reject invalidated sessions before querying UUID columns.
- Header cart/wishlist counters do not fetch for invalidated sessions.
- Super Admin is correctly offered the Admin Dashboard link in the account menu.
- Catalog/menu data is client-cached and request-deduplicated for 5 minutes so Header/Main Navigation/Mobile Nav/Search/Vehicle Finder/Product filters no longer fire duplicate `/api/catalog/options` requests on every page mount.
- Footer storefront data is also client-cached/request-deduplicated.

## Why the error happened
The security upgrade invalidates old JWT sessions when their session version no longer matches the database. The previous session callback represented an invalidated user id as an empty string. Cart and wishlist routes only checked that `session.user` existed, then sent the empty string into PostgreSQL UUID comparisons, producing `22P02 invalid input syntax for type uuid: ""`.

## QA
- `npx tsc --noEmit`: PASS
- ESLint: 0 errors; existing `next/image` optimization warnings remain.

## After replacing the project
Stop the dev server, remove `.next`, restart, and sign in again so any pre-hotfix browser session is replaced.
