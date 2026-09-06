const base = process.env.QA_BASE_URL || "http://localhost:3000";

type Check = {
  path: string;
  statuses: number[];
  contains?: string[];
  notContains?: string[];
};

const chrome = ["AUTO", "PARTS STORE", "Customer Support"];
const checks: Check[] = [
  { path: "/", statuses: [200], contains: chrome },
  { path: "/products", statuses: [200], contains: chrome },
  { path: "/brands", statuses: [200], contains: chrome },
  { path: "/categories", statuses: [200], contains: chrome },
  { path: "/parts-finder", statuses: [200], contains: [...chrome, "Search Parts"] },
  { path: "/offers", statuses: [200], contains: chrome },
  { path: "/contact", statuses: [200], contains: chrome },
  { path: "/api/catalog/options", statuses: [200] },
  { path: "/api/storefront/footer", statuses: [200] },
  { path: "/api/cart", statuses: [401] },
  { path: "/api/wishlist", statuses: [401] },
  { path: "/api/admin/attention-counts", statuses: [401, 403, 428] },
  { path: "/api/admin/search?q=brake", statuses: [401, 403, 428] },
  { path: "/blog", statuses: [404] },
];

let failed = 0;
for (const check of checks) {
  try {
    const response = await fetch(base + check.path, { redirect: "manual" });
    let ok = check.statuses.includes(response.status);
    const body = check.contains?.length || check.notContains?.length ? await response.text() : "";
    if (ok && check.contains) ok = check.contains.every((needle) => body.includes(needle));
    if (ok && check.notContains) ok = check.notContains.every((needle) => !body.includes(needle));
    console.log(`${ok ? "PASS" : "FAIL"} ${response.status} ${check.path}`);
    if (!ok) {
      failed += 1;
      if (check.contains) {
        const missing = check.contains.filter((needle) => !body.includes(needle));
        if (missing.length) console.error(`  Missing expected content: ${missing.join(", ")}`);
      }
    }
  } catch (error) {
    console.log(`FAIL network ${check.path}`, error);
    failed += 1;
  }
}
if (failed) {
  console.error(`${failed} smoke check(s) failed.`);
  process.exit(1);
}
console.log(`All ${checks.length} smoke checks passed.`);
export {};
