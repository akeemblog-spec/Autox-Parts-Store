"use client";
/* eslint-disable react-hooks/set-state-in-effect -- state is intentionally reset when external auth/search/filter inputs change */


import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Heart, CreditCard, Bike, Check, ChevronDown, LayoutGrid, Rows3, GitCompareArrows } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { FilterSidebar, FilterGroup } from "@/components/FilterSidebar";
import { FilterDrawer, FilterDrawerTrigger } from "@/components/FilterDrawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { getCachedCatalogOptions, loadCatalogOptions } from "@/lib/client/storefront-cache";

interface LiveProduct {
  id: string; slug: string; name: string; price: number; previousPrice: number | null; discount: number | null;
  rating: number; reviewCount: number; stock: number; genuine: boolean; installmentAvailable: boolean; partType: string;
  brand: { name: string }; images: { url: string; alt: string }[];
}

const defaultPartTypeOptions = [
  { label: "Genuine Honda", value: "genuine_honda" }, { label: "Genuine", value: "genuine" },
  { label: "OEM", value: "oem" }, { label: "Aftermarket", value: "aftermarket" },
];
const sortOptions = [
  { value: "popularity", label: "Popularity" }, { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" }, { value: "rating", label: "Highest Rated" }, { value: "newest", label: "Newest" },
];
const PAGE_SIZE = 24;

export function LiveProductGrid({ brandSlug, categorySlug, vehicleType, model, year, showPartTypeFilter = false, categoryOptions, searchQuery }: {
  brandSlug?: string; categorySlug?: string; vehicleType?: string; model?: string; year?: string; showPartTypeFilter?: boolean;
  categoryOptions?: { label: string; value: string }[]; searchQuery?: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<LiveProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState<Record<string, string[]>>({ partType: [], category: [] });
  const [priceMax, setPriceMax] = useState(500000);
  const [sort, setSort] = useState("popularity");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [compared, setCompared] = useState<Set<string>>(new Set());
  const cachedCatalog = getCachedCatalogOptions();
  const [partTypeOptions, setPartTypeOptions] = useState((cachedCatalog?.partTypes?.length ? cachedCatalog.partTypes : defaultPartTypeOptions) as { label: string; value: string }[]);
  const [mobileColumns, setMobileColumns] = useState<1 | 2>(2);

  useEffect(() => {
    loadCatalogOptions().then((d) => { if (d?.partTypes?.length) setPartTypeOptions(d.partTypes as { label: string; value: string }[]); });
  }, []);

  useEffect(() => {
    if (!session?.user?.id || session.user.invalidated) { setWishlisted(new Set()); return; }
    fetch("/api/wishlist", { cache: "no-store" }).then((res) => res.ok ? res.json() : { items: [] }).then((data) => setWishlisted(new Set((data.items ?? []).map((item: { product?: { id?: string } }) => item.product?.id).filter(Boolean) as string[]))).catch(() => {});
  }, [session?.user?.id, session?.user?.invalidated]);

  const makeParams = (offset = 0) => {
    const params = new URLSearchParams();
    if (brandSlug) params.set("brand", brandSlug);
    if (categorySlug) params.set("category", categorySlug);
    if (vehicleType) params.set("vehicleType", vehicleType);
    if (model) params.set("model", model);
    if (year) params.set("year", year);
    if (searchQuery?.trim() && searchQuery.trim().length >= 3) params.set("q", searchQuery.trim());
    selected.category?.forEach((c) => params.append("category", c));
    selected.partType?.forEach((t) => params.append("partType", t));
    params.set("priceMax", String(priceMax));
    params.set("sort", sort);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(offset));
    return params;
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/products?${makeParams(0).toString()}`, { cache: "no-store" })
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("Failed to load products")))
      .then((data) => { if (alive) { setProducts(data.products ?? []); setHasMore(Boolean(data.hasMore)); } })
      .catch(() => { if (alive) { setProducts([]); setHasMore(false); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandSlug, categorySlug, vehicleType, model, year, searchQuery, selected, priceMax, sort]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/products?${makeParams(products.length).toString()}`, { cache: "no-store" });
      const data = res.ok ? await res.json() : null;
      if (!data) return;
      setProducts((current) => {
        const seen = new Set(current.map((p) => p.id));
        return [...current, ...(data.products ?? []).filter((p: LiveProduct) => !seen.has(p.id))];
      });
      setHasMore(Boolean(data.hasMore));
    } finally { setLoadingMore(false); }
  };

  const filterGroups: FilterGroup[] = useMemo(() => {
    const groups: FilterGroup[] = [];
    if (showPartTypeFilter) groups.push({ id: "partType", title: "Part Type", options: partTypeOptions });
    if (categoryOptions) groups.push({ id: "category", title: "Category", options: categoryOptions });
    return groups;
  }, [showPartTypeFilter, categoryOptions, partTypeOptions]);

  const toggleFilter = (groupId: string, value: string) => setSelected((prev) => {
    const current = prev[groupId] ?? [];
    return { ...prev, [groupId]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] };
  });
  const clearFilters = () => { setSelected({ partType: [], category: [] }); setPriceMax(500000); };

  const toggleWishlist = async (productId: string) => {
    if (!session?.user?.id || session.user.invalidated) { router.push("/login?callbackUrl=/products"); return; }
    const removing = wishlisted.has(productId);
    setWishlisted((prev) => { const next = new Set(prev); removing ? next.delete(productId) : next.add(productId); return next; });
    const res = await fetch(removing ? `/api/wishlist/${productId}` : "/api/wishlist", {
      method: removing ? "DELETE" : "POST",
      headers: removing ? undefined : { "Content-Type": "application/json" },
      body: removing ? undefined : JSON.stringify({ productId }),
    });
    if (!res.ok) setWishlisted((prev) => { const next = new Set(prev); removing ? next.add(productId) : next.delete(productId); return next; });
    else window.dispatchEvent(new Event("autox-wishlist-updated"));
  };

  const addToCompare = async (productId: string) => {
    if (!session?.user?.id || session.user.invalidated) { router.push('/login?callbackUrl=/products'); return; }
    const res = await fetch('/api/compare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) });
    if (res.ok) setCompared((current) => new Set(current).add(productId));
  };

  const addToCart = async (productId: string) => {
    if (!session?.user?.id || session.user.invalidated) { router.push("/login"); return; }
    setAddingId(productId);
    const res = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, quantity: 1 }) });
    setAddingId(null);
    if (res.ok) { setAddedId(productId); window.dispatchEvent(new Event("autox-cart-updated")); window.setTimeout(() => setAddedId((current) => current === productId ? null : current), 1200); }
  };

  return (
    <div className="flex gap-8">
      {filterGroups.length > 0 && <div className="hidden lg:block"><FilterSidebar groups={filterGroups} selected={selected} onToggle={toggleFilter} priceMin={0} priceMax={priceMax} priceBound={500000} onPriceChange={setPriceMax} onApply={() => {}} onClear={clearFilters} /></div>}

      <div className="min-w-0 flex-1">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-autox-border pb-4">
          <p className="text-sm text-autox-gray">{loading ? "Loading…" : <><span className="font-semibold text-white">{products.length}</span>{hasMore ? "+" : ""} results</>}</p>
          <div className="flex items-center gap-2">
            {filterGroups.length > 0 && <FilterDrawerTrigger onClick={() => setDrawerOpen(true)} />}
            <div className="flex overflow-hidden rounded-xl border border-autox-border lg:hidden" aria-label="Mobile product layout">
              <button type="button" aria-label="Two column view" aria-pressed={mobileColumns === 2} onClick={() => setMobileColumns(2)} className={cn("flex h-9 w-9 items-center justify-center", mobileColumns === 2 ? "bg-autox-red text-white" : "bg-autox-panel3 text-autox-gray")}><LayoutGrid size={15} /></button>
              <button type="button" aria-label="One column view" aria-pressed={mobileColumns === 1} onClick={() => setMobileColumns(1)} className={cn("flex h-9 w-9 items-center justify-center border-l border-autox-border", mobileColumns === 1 ? "bg-autox-red text-white" : "bg-autox-panel3 text-autox-gray")}><Rows3 size={15} /></button>
            </div>
            <div className="relative">
              <select aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 max-w-[150px] appearance-none rounded-xl border border-autox-border bg-autox-panel3 pl-3 pr-7 text-xs text-white outline-none focus:border-autox-red sm:max-w-none">
                {sortOptions.map((o) => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-autox-gray" />
            </div>
          </div>
        </div>

        {!loading && products.length === 0 ? <EmptyState title="No parts match your filters" description={searchQuery ? `No results found for “${searchQuery}”. Try another keyword or filter.` : "Try adjusting or clearing your filters to see more results."} /> : (
          <>
            <div className={cn("grid gap-3 sm:gap-4 sm:grid-cols-3 xl:grid-cols-4", mobileColumns === 2 ? "grid-cols-2" : "grid-cols-1")}>
              {products.map((product) => (
                <div key={product.id} className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-autox-border bg-autox-panel transition-all duration-300 hover:-translate-y-1 hover:border-autox-red/60">
                  <div className="relative aspect-square overflow-hidden bg-autox-panel3">
                    {product.genuine && <Badge variant="genuine" className="absolute left-2 top-2 z-10">Genuine</Badge>}
                    {product.discount && <Badge variant="discount" className="absolute right-10 top-2 z-10">{product.discount}% OFF</Badge>}
                    <button aria-label="Toggle wishlist" onClick={() => toggleWishlist(product.id)} className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 backdrop-blur transition-colors hover:bg-autox-red"><Heart size={14} className={wishlisted.has(product.id) ? "fill-autox-red text-autox-red" : "text-white"} /></button>
                    <Link href={`/products/${product.slug}`}>{product.images[0] && <img loading="lazy" decoding="async" src={product.images[0].url} alt={product.images[0].alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}</Link>
                    {product.stock === 0 && <div className="absolute inset-0 flex items-center justify-center bg-black/70"><Badge variant="outOfStock">Out of Stock</Badge></div>}
                  </div>
                  <div className="flex flex-1 flex-col p-2.5 sm:p-3.5">
                    <Link href={`/products/${product.slug}`} className="line-clamp-2 text-xs font-semibold leading-snug text-white transition-colors hover:text-autox-red sm:text-sm">{product.name}</Link>
                    <p className="mt-1 truncate text-[10px] text-autox-gray sm:text-[11px]">{product.brand.name}</p>
                    <div className="mt-2"><Rating value={product.rating} reviewCount={product.reviewCount} /></div>
                    <div className="mt-2 flex flex-wrap items-end justify-between gap-1"><PriceDisplay price={product.price} previousPrice={product.previousPrice ?? undefined} size="sm" /><span className={cn("text-[9px] font-semibold sm:text-[10px]", product.stock > 0 ? "text-green-500" : "text-autox-gray")}>{product.stock > 0 ? "In Stock" : "Out of Stock"}</span></div>
                    <div className="mt-3 flex flex-col gap-1.5">
                      <button disabled={product.stock === 0 || addingId === product.id} onClick={() => addToCart(product.id)} className={cn("relative flex h-9 items-center justify-center gap-1.5 overflow-hidden rounded-xl text-[10px] font-bold uppercase tracking-wide text-white transition-all disabled:bg-autox-panel3 disabled:text-autox-gray sm:text-xs", addedId === product.id ? "bg-autox-panel3 text-white ring-1 ring-autox-red" : "bg-autox-red hover:bg-autox-redDark")}>{addingId === product.id ? <><Bike size={15} className="autox-bike-run" /><span className="opacity-60">Adding…</span></> : addedId === product.id ? <><Check size={14} /> Added</> : <><ShoppingCart size={13} /> Add to Cart</>}</button>
                      {product.installmentAvailable && <span className="flex h-8 items-center justify-center gap-1.5 rounded-xl border border-autox-border text-[10px] font-semibold uppercase tracking-wide text-autox-gray sm:text-[11px]"><CreditCard size={12} /> Installment available</span>}
                      <button type="button" onClick={() => addToCompare(product.id)} className="flex h-8 items-center justify-center gap-1.5 rounded-xl border border-autox-border text-[10px] font-semibold uppercase tracking-wide text-autox-gray hover:border-autox-red/50 hover:text-white sm:text-[11px]"><GitCompareArrows size={12}/>{compared.has(product.id) ? "Compared" : "Compare"}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {hasMore && <div className="mt-7 flex justify-center"><button type="button" onClick={loadMore} disabled={loadingMore} className="min-w-40 rounded-xl border border-autox-red bg-autox-red px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-autox-redDark disabled:opacity-60">{loadingMore ? "Loading…" : "Load More"}</button></div>}
          </>
        )}
      </div>

      {filterGroups.length > 0 && <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} groups={filterGroups} selected={selected} onToggle={toggleFilter} priceMin={0} priceMax={priceMax} priceBound={500000} onPriceChange={setPriceMax} onApply={() => {}} onClear={clearFilters} />}
    </div>
  );
}
