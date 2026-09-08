import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
let failed = 0;

function pass(label: string) {
  console.log(`PASS ${label}`);
}
function fail(label: string) {
  failed += 1;
  console.error(`FAIL ${label}`);
}
function expect(condition: boolean, label: string) {
  condition ? pass(label) : fail(label);
}
function text(path: string) {
  return readFileSync(join(root, path), "utf8");
}
function walk(path: string): string[] {
  const absolute = join(root, path);
  if (!existsSync(absolute)) return [];
  const out: string[] = [];
  for (const name of readdirSync(absolute)) {
    if (["node_modules", ".next", ".git"].includes(name)) continue;
    const child = join(absolute, name);
    const rel = child.slice(root.length + 1).replaceAll("\\", "/");
    if (statSync(child).isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}

const storefrontLayout = text("app/(storefront)/layout.tsx");
for (const component of ["<TopBar", "<Header", "<MainNavigation", "<Footer"]) {
  expect(storefrontLayout.includes(component), `storefront layout renders ${component.slice(1)}`);
}
expect(storefrontLayout.includes("{children}"), "storefront layout renders route content");

const expectedPublicRoutes = [
  "app/(storefront)/page.tsx",
  "app/(storefront)/products/page.tsx",
  "app/(storefront)/cart/page.tsx",
  "app/(storefront)/wishlist/page.tsx",
  "app/(storefront)/compare/page.tsx",
  "app/(storefront)/parts-finder/page.tsx",
  "app/(storefront)/brands/page.tsx",
  "app/(storefront)/categories/page.tsx",
  "app/(storefront)/offers/page.tsx",
  "app/(storefront)/contact/page.tsx",
  "app/(storefront)/account/page.tsx",
  "app/(storefront)/orders/track/page.tsx",
];
for (const route of expectedPublicRoutes) expect(existsSync(join(root, route)), `route exists: ${route}`);

const adminRoutes = [
  "app/admin/page.tsx",
  "app/admin/orders/page.tsx",
  "app/admin/products/page.tsx",
  "app/admin/catalog/page.tsx",
  "app/admin/inventory/page.tsx",
  "app/admin/customers/page.tsx",
  "app/admin/reviews/page.tsx",
  "app/admin/messages/page.tsx",
  "app/admin/returns/page.tsx",
  "app/admin/coupons/page.tsx",
  "app/admin/storefront/page.tsx",
  "app/admin/settings/page.tsx",
  "app/admin/admins/page.tsx",
  "app/admin/security/page.tsx",
];
for (const route of adminRoutes) expect(existsSync(join(root, route)), `admin route exists: ${route}`);

const allSource = walk("app")
  .concat(walk("components"))
  .filter((p) => /\.(ts|tsx|js|jsx)$/.test(p))
  .map((p) => text(p).toLowerCase())
  .join("\n");
expect(!allSource.includes('href="/blog') && !allSource.includes("href='/blog"), "no Blog navigation remains");


// Interaction consistency: no native browser alert/confirm/prompt dialogs in app code.
const interactiveSource = walk("app").concat(walk("components")).filter((p) => /\.(ts|tsx|js|jsx)$/.test(p)).map((p)=>text(p)).join("\n");
expect(!/\bwindow\.(alert|confirm|prompt)\s*\(/.test(interactiveSource), "no window alert/confirm/prompt dialogs");
expect(!/(^|[^A-Za-z0-9_])(alert|confirm|prompt)\s*\([`'"]/.test(interactiveSource), "no native alert/confirm/prompt calls");
expect(text("app/layout.tsx").includes("<AppUIProvider>"), "global AutoX modal/toast provider installed");

for (const route of ["orders","products","inventory","customers","reviews","messages","returns","coupons","security"]) {
  expect(text(`app/admin/${route}/page.tsx`).includes("<Pagination"), `admin ${route} uses pagination`);
}
expect(text("components/LiveProductGrid.tsx").includes("const PAGE_SIZE = 24"), "storefront product grid loads 24 products per page batch");
expect(text("components/admin/AdminHeader.tsx").includes("focus-within:border-autox-red"), "admin search uses one focus-within border state");

const cartPage = text("app/(storefront)/cart/page.tsx");
expect(cartPage.includes("xl:sticky xl:top-28"), "cart order summary is sticky on desktop");
expect(cartPage.includes("SectionHeading step=\"2\""), "cart has delivery section");
expect(cartPage.includes("SectionHeading step=\"3\""), "cart has payment section");
expect(cartPage.includes("Remove from cart?"), "cart removal uses AutoX confirmation modal");
expect(cartPage.includes("Saved Addresses"), "cart supports saved address selection");
expect(cartPage.includes("Coupon ("), "cart summary exposes coupon discount row");


const productManager = text("components/admin/AdminProductsManager.tsx");
expect(productManager.includes("Archive product?") && productManager.includes("Restore product?"), "product archive/restore UI exists");
expect(text("app/api/admin/products/[id]/route.ts").includes("PRODUCT_HAS_HISTORY"), "product delete protects historical references");
expect(existsSync(join(root, "app/api/admin/products/[id]/archive/route.ts")), "product archive API exists");
expect(text("lib/db-queries/products.ts").includes("products.archivedAt"), "storefront product queries exclude archived products");
expect(text("components/admin/AdminSidebar.tsx").includes("overflow-y-auto") && text("components/admin/AdminSidebar.tsx").includes("h-dvh"), "admin sidebar scrolls within viewport");
expect(text("components/admin/AdminNotifications.tsx").includes("document.addEventListener('mousedown'") && text("components/admin/AdminNotifications.tsx").includes("Escape"), "notifications close on outside click and Escape");
expect(text("components/admin/AdminHeader.tsx").includes("focus-within:border-autox-red") && text("components/admin/AdminHeader.tsx").includes("focus-visible:outline-none"), "admin header search has a single controlled focus state");
expect(text("components/admin/AdminProductsManager.tsx").includes("Search products...") && text("components/admin/AdminInventoryManager.tsx").includes("Search inventory by product name..."), "admin page searches sit with their page headers");

const journal = text("db/migrations/meta/_journal.json");
expect(journal.includes('"tag": "0006_full_qa_cleanup"'), "0006 migration registered");
expect(journal.includes('"tag": "0007_operations_enhancements"'), "0007 migration registered");
expect(journal.includes('"tag": "0008_product_archive_ui_hardening"'), "0008 migration registered");
expect(existsSync(join(root, "db/migrations/0006_full_qa_cleanup.sql")), "0006 migration file exists");
expect(existsSync(join(root, "db/migrations/0007_operations_enhancements.sql")), "0007 migration file exists");
expect(existsSync(join(root, "db/migrations/0008_product_archive_ui_hardening.sql")), "0008 migration file exists");


// Mobile storefront UX regression checks.
const mobileNav = text("components/MobileFloatingNav.tsx");
for (const label of ["Home", "Categories", "Search", "Account", "Cart"]) {
  expect(mobileNav.includes(`label: "${label}"`), `mobile floating nav includes ${label}`);
}
expect(mobileNav.includes('bottom: "calc(10px + env(safe-area-inset-bottom))"'), "mobile floating nav respects device safe area");
expect(mobileNav.includes("loadCatalogOptions()"), "mobile category sheet uses live catalog options");
expect(mobileNav.includes("<SearchBar mobile autoFocus"), "mobile search sheet reuses live product search");
expect(mobileNav.includes('isAuthenticated ? "/account" : "/login"'), "mobile Account destination follows authentication state");
expect(mobileNav.includes('window.addEventListener("autox-cart-updated"'), "mobile Cart badge listens for live cart updates");
expect(mobileNav.includes("visibleCartCount = isAuthenticated ? cartCount : 0"), "logged-out Cart badge is derived without effect state resets");
expect(!mobileNav.includes("setCartCount(0);"), "mobile Cart effect avoids synchronous logout state reset");
expect(existsSync(join(root, "components/account/MobileAccountNav.tsx")), "mobile My Account navigation exists");
expect(text("app/(storefront)/account/layout.tsx").includes("<MobileAccountNav"), "account routes render mobile My Account navigation");
expect(!existsSync(join(root, "app/(storefront)/account/loading.tsx")), "account tab navigation no longer swaps to a full-page skeleton");
expect(existsSync(join(root, "components/HomeLaunchExperience.tsx")), "homepage uses dedicated superbike launch experience instead of generic spinner");
expect(existsSync(join(root, "app/favicon.ico")), "favicon exists");
expect(existsSync(join(root, "app/icon.svg")), "SVG app icon exists");
expect(existsSync(join(root, "app/apple-icon.png")), "Apple touch icon exists");
expect(existsSync(join(root, "app/manifest.ts")), "web app manifest exists");


// 2026-09 mobile + hero polish regression checks.
const mobileDrawer = text("components/MobileNav.tsx");
expect(!mobileDrawer.includes("max-h-56 overflow-y-auto"), "mobile drawer accordions expand without nested scrollbars");
expect(mobileDrawer.includes("Track Order"), "mobile drawer footer uses Track Order instead of duplicate Cart");
expect(mobileDrawer.includes("compareCount"), "mobile drawer exposes live Compare count");
const header = text("components/Header.tsx");
expect(header.includes('href="/wishlist"') && header.includes('md:hidden'), "mobile header fills right action with Wishlist");
expect(header.includes("autox-compare-updated"), "header refreshes Compare count from live events");
expect(text("app/globals.css").includes(".autox-count-badge"), "storefront uses unified AutoX red count badge");
expect(!mobileNav.includes('bg-white px-1 text-[9px] font-black leading-none text-black'), "mobile Cart badge no longer uses white circle styling");
expect(mobileNav.includes('active: panel === "search"'), "mobile Search active state follows the Search panel");
expect(text("app/(storefront)/compare/page.tsx").includes("lg:hidden") && text("app/(storefront)/compare/page.tsx").includes("2 / 4") === false, "Compare has a dedicated responsive mobile layout");
expect(text("app/(storefront)/wishlist/page.tsx").includes("useAppUI") && text("app/(storefront)/wishlist/page.tsx").includes("Removed from your wishlist"), "Wishlist uses branded feedback and rollback-aware removal");
expect(text("components/ProductCard.tsx").includes("loadSavedProductState") && text("components/ProductCard.tsx").includes("autox-compare-updated"), "product cards hydrate Wishlist and Compare state");
expect(text("components/Hero.tsx").includes("Genuine performance parts") && text("components/Hero.tsx").includes("heroProgress") && !text("components/Hero.tsx").includes("Parts matched to your ride"), "Hero keeps premium layout with visible slider controls and no image-overlap label");
expect(!text("components/VehicleFinder.tsx").includes("lg:-mt-7") && text("components/VehicleFinder.tsx").includes("lg:pt-7"), "vehicle finder no longer overlaps hero slider controls");
expect(text("app/(storefront)/orders/track/page.tsx").includes("Express Delivery Fee") && text("app/(storefront)/orders/track/page.tsx").includes("item.productName") && text("app/(storefront)/orders/track/page.tsx").includes("Delivery Information"), "track order summary includes line items and delivery breakdown");
expect(text("app/(storefront)/account/orders/page.tsx").includes("Price Breakdown") && text("app/(storefront)/account/orders/page.tsx").includes("Express Delivery Fee"), "My Orders uses redesigned subtotal and delivery breakdown");
expect(text("components/VehicleFinder.tsx").includes("Find Parts For") && text("components/VehicleFinder.tsx").includes("rounded-2xl"), "vehicle finder matches redesigned Hero system");
expect(text("components/FilterDrawer.tsx").includes("flex max-h-[88dvh] flex-col") && text("components/FilterDrawer.tsx").includes("min-h-0 flex-1 overflow-y-auto"), "mobile Filter drawer keeps header fixed while content scrolls");
expect(text("components/ui/AppUIProvider.tsx").includes("6.8rem+env(safe-area-inset-bottom)"), "mobile toasts clear the floating navigation");

if (failed) {
  console.error(`\n${failed} integrity check(s) failed.`);
  process.exit(1);
}
console.log("\nAll integrity checks passed.");
