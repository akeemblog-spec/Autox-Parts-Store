"use client";
/* eslint-disable react-hooks/set-state-in-effect -- state is intentionally reset when external auth/search/filter inputs change */


import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getCachedCatalogOptions, loadCatalogOptions } from "@/lib/client/storefront-cache";

type C = { label: string; value: string };
type SearchProduct = { id: string; slug: string; name: string; price: number; brand?: { name?: string }; images?: { url: string; alt: string }[] };

export function SearchBar({ mobile = false, onNavigate, autoFocus = false }: { mobile?: boolean; onNavigate?: () => void; autoFocus?: boolean }) {
  const router = useRouter();
  const [category, setCategory] = useState("all");
  const cached = getCachedCatalogOptions();
  const [categories, setCategories] = useState<C[]>((cached?.categories ?? []) as C[]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    loadCatalogOptions().then((d) => { if (d) setCategories((d.categories ?? []) as C[]); });
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    const current = ++requestId.current;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: trimmed, limit: "6" });
        if (category !== "all") params.set("category", category);
        const res = await fetch(`/api/products?${params.toString()}`, { cache: "no-store" });
        const data = res.ok ? await res.json() : null;
        if (current !== requestId.current) return;
        setResults(data?.products ?? []);
        setOpen(true);
      } catch {
        if (current === requestId.current) setResults([]);
      } finally {
        if (current === requestId.current) setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, category]);

  const submit = () => {
    const trimmed = query.trim();
    if (trimmed.length < 3) return;
    const params = new URLSearchParams({ q: trimmed });
    if (category !== "all") params.set("category", category);
    setOpen(false);
    onNavigate?.();
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className={cn("relative", mobile ? "w-full" : "hidden flex-1 max-w-2xl md:block")}>
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className={cn("flex items-stretch overflow-hidden rounded-xl border border-autox-border transition-colors focus-within:border-autox-red", mobile ? "h-10" : "h-11")}
      >
        <label htmlFor={mobile ? "mobile-site-search" : "site-search"} className="sr-only">Search for parts, brands, categories or models</label>
        <input
          id={mobile ? "mobile-site-search" : "site-search"}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 3 && setOpen(true)}
          placeholder="Search parts, brands, models..."
          autoComplete="off"
          autoFocus={autoFocus}
          className="min-w-0 flex-1 bg-autox-panel2 px-3 md:px-4 text-sm text-white outline-none placeholder:text-autox-gray"
        />
        {!mobile && (
          <div className="relative hidden items-center border-l border-autox-border bg-autox-panel3 lg:flex">
            <select aria-label="Select category to search within" value={category} onChange={(e) => setCategory(e.target.value)} className="h-full appearance-none bg-transparent pl-3 pr-7 text-xs text-autox-gray outline-none">
              <option value="all">All Categories</option>
              {categories.map((c) => <option key={c.value} value={c.value} className="bg-autox-panel2">{c.label}</option>)}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2.5 text-autox-gray" />
          </div>
        )}
        <button type="submit" aria-label="Search" disabled={query.trim().length < 3} className="flex w-11 md:w-12 items-center justify-center bg-autox-red text-white transition-colors hover:bg-autox-redDark disabled:cursor-not-allowed disabled:opacity-50"><Search size={18} /></button>
      </form>

      {open && query.trim().length >= 3 && (
        <div className="absolute left-0 right-0 top-full z-[360] mt-1 overflow-hidden rounded-xl border border-autox-border bg-autox-panel2 shadow-2xl">
          {loading ? (
            <div className="px-4 py-4 text-xs text-autox-gray">Searching…</div>
          ) : results.length > 0 ? (
            <>
              {results.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`} onClick={() => { setOpen(false); onNavigate?.(); }} className="flex items-center gap-3 border-b border-autox-border/70 px-3 py-2.5 transition-colors last:border-0 hover:bg-autox-panel3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-autox-panel3">
                    {product.images?.[0] && <img src={product.images[0].url} alt={product.images[0].alt || product.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">{product.name}</p>
                    <p className="truncate text-[10px] text-autox-gray">{product.brand?.name || "AutoX Parts"}</p>
                  </div>
                  <span className="text-[10px] font-bold text-autox-red">LKR {Math.round(product.price).toLocaleString()}</span>
                </Link>
              ))}
              <button type="button" onClick={submit} className="w-full px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-autox-red hover:bg-autox-panel3">View all results</button>
            </>
          ) : (
            <div className="px-4 py-4 text-xs text-autox-gray">No matching parts found. Try another keyword.</div>
          )}
        </div>
      )}
    </div>
  );
}
