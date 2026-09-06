"use client";

type CatalogPayload = {
  brands?: Array<{ id: string; label: string; value: string; vehicleType: string }>;
  categories?: Array<{ id: string; label: string; value: string }>;
  vehicleTypes?: Array<{ label: string; value: string }>;
  partTypes?: Array<{ label: string; value: string }>;
  [key: string]: unknown;
};

type FooterPayload = {
  bikeBrands: Array<{ id: string; name: string; slug: string }>;
  threeWheelerBrands: Array<{ id: string; name: string; slug: string }>;
  allBrands: Array<{ id: string; name: string; slug: string }>;
  settings: Record<string, string>;
};

const TTL = 5 * 60_000;
let catalogCache: { value: CatalogPayload; at: number } | null = null;
let catalogPromise: Promise<CatalogPayload | null> | null = null;
let footerCache: { value: FooterPayload; at: number } | null = null;
let footerPromise: Promise<FooterPayload | null> | null = null;

export function getCachedCatalogOptions() {
  return catalogCache?.value ?? null;
}

export async function loadCatalogOptions(): Promise<CatalogPayload | null> {
  if (catalogCache && Date.now() - catalogCache.at < TTL) return catalogCache.value;
  if (catalogPromise) return catalogPromise;
  catalogPromise = fetch("/api/catalog/options", { cache: "no-store" })
    .then(async (r) => (r.ok ? ((await r.json()) as CatalogPayload) : null))
    .then((value) => {
      if (value) catalogCache = { value, at: Date.now() };
      return value;
    })
    .catch(() => null)
    .finally(() => { catalogPromise = null; });
  return catalogPromise;
}

export function getCachedFooter() {
  return footerCache?.value ?? null;
}

export async function loadFooterPayload(): Promise<FooterPayload | null> {
  if (footerCache && Date.now() - footerCache.at < TTL) return footerCache.value;
  if (footerPromise) return footerPromise;
  footerPromise = fetch("/api/storefront/footer", { cache: "no-store" })
    .then(async (r) => (r.ok ? ((await r.json()) as FooterPayload) : null))
    .then((value) => {
      if (value) footerCache = { value, at: Date.now() };
      return value;
    })
    .catch(() => null)
    .finally(() => { footerPromise = null; });
  return footerPromise;
}
