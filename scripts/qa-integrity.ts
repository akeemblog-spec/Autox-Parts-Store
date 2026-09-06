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

if (failed) {
  console.error(`\n${failed} integrity check(s) failed.`);
  process.exit(1);
}
console.log("\nAll integrity checks passed.");
