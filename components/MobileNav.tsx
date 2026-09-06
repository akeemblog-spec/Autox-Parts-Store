"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, GitCompareArrows, Heart, Menu, ShoppingCart, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SearchBar } from "./SearchBar";
import { getCachedCatalogOptions, loadCatalogOptions } from "@/lib/client/storefront-cache";

type BrandOption = { id: string; label: string; value: string; vehicleType: string };
type CategoryOption = { id: string; label: string; value: string };

type NavGroup = { id: string; label: string; href: string; children?: { label: string; href: string }[] };

export function MobileNav({ cartCount = 0, wishlistCount = 0 }: { cartCount?: number; wishlistCount?: number }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const cached = getCachedCatalogOptions();
  const [brands, setBrands] = useState<BrandOption[]>((cached?.brands ?? []) as BrandOption[]);
  const [categories, setCategories] = useState<CategoryOption[]>((cached?.categories ?? []) as CategoryOption[]);

  useEffect(() => {
    loadCatalogOptions().then((d) => {
      if (!d) return;
      setBrands((d.brands ?? []) as BrandOption[]);
      setCategories((d.categories ?? []) as CategoryOption[]);
    });
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const groups = useMemo<NavGroup[]>(() => {
    const bikeBrands = brands.filter((b) => b.vehicleType === "bike").map((b) => ({ label: b.label, href: `/brands/${b.value}` }));
    const threeBrands = brands.filter((b) => b.vehicleType === "three-wheeler").map((b) => ({ label: b.label, href: `/brands/${b.value}` }));
    return [
      { id: "home", label: "Home", href: "/" },
      { id: "categories", label: "All Categories", href: "/categories", children: categories.map((c) => ({ label: c.label, href: `/categories/${c.value}` })) },
      { id: "bikes", label: "Bikes", href: "/bikes", children: bikeBrands },
      { id: "three-wheelers", label: "Three Wheelers", href: "/three-wheelers", children: threeBrands },
      { id: "brands", label: "Brands", href: "/brands" },
      { id: "parts-finder", label: "Parts Finder", href: "/parts-finder" },
      { id: "services", label: "Services", href: "/services" },
      { id: "offers", label: "Offers", href: "/offers" },
      { id: "contact", label: "Contact", href: "/contact" },
    ];
  }, [brands, categories]);

  const close = () => { setOpen(false); setExpanded(null); };

  return (
    <div className="lg:hidden">
      <button aria-label="Open menu" onClick={() => setOpen(true)} className="p-2 text-white"><Menu size={22} /></button>

      <div className={cn("fixed inset-0 z-[300] transition-opacity duration-300", open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" onClick={close} />
        <aside className={cn("absolute left-0 top-0 flex h-[100dvh] w-[86%] max-w-sm flex-col border-r border-autox-border bg-autox-panel2 shadow-2xl transition-transform duration-300", open ? "translate-x-0" : "-translate-x-full")}>
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-autox-border px-4">
            <span className="font-extrabold tracking-tight text-white">AUTO<span className="text-autox-red">X</span></span>
            <button aria-label="Close menu" onClick={close} className="p-1 text-white"><X size={20} /></button>
          </div>

          <div className="shrink-0 border-b border-autox-border p-4"><SearchBar mobile onNavigate={close} /></div>

          <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2">
            {groups.map((group) => {
              const hasChildren = Boolean(group.children?.length);
              const isOpen = expanded === group.id;
              return (
                <div key={group.id} className="border-b border-autox-border/60">
                  <div className="flex items-center">
                    <Link href={group.href} onClick={close} className="min-w-0 flex-1 px-4 py-3 text-sm font-semibold text-white">{group.label}</Link>
                    {hasChildren && (
                      <button type="button" aria-label={`${isOpen ? "Collapse" : "Expand"} ${group.label}`} aria-expanded={isOpen} onClick={() => setExpanded((v) => v === group.id ? null : group.id)} className="mr-2 flex h-9 w-9 items-center justify-center rounded-sm border border-autox-border bg-autox-panel3 text-autox-gray hover:border-autox-red hover:text-white">
                        <ChevronDown size={15} className={cn("transition-transform", isOpen && "rotate-180")} />
                      </button>
                    )}
                  </div>
                  {hasChildren && (
                    <div className={cn("grid overflow-hidden bg-black/25 transition-[grid-template-rows] duration-300", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                      <div className="min-h-0 overflow-hidden">
                        <div className="max-h-56 overflow-y-auto border-t border-autox-border/60 py-1">
                          {group.children!.map((child) => <Link key={child.href} href={child.href} onClick={close} className="block px-7 py-2.5 text-xs text-autox-gray transition-colors hover:bg-autox-panel3 hover:text-white">{child.label}</Link>)}
                          <Link href={group.href} onClick={close} className="block px-7 py-2.5 text-xs font-bold uppercase tracking-wide text-autox-red">View all {group.label}</Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="grid shrink-0 grid-cols-3 border-t border-autox-border bg-autox-panel2">
            <Link href="/wishlist" onClick={close} className="flex flex-col items-center gap-1 py-3 text-[10px] text-autox-gray"><span className="relative"><Heart size={18} />{wishlistCount > 0 && <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-autox-red text-[9px] text-white">{wishlistCount}</span>}</span>Wishlist</Link>
            <Link href="/compare" onClick={close} className="flex flex-col items-center gap-1 border-x border-autox-border py-3 text-[10px] text-autox-gray"><GitCompareArrows size={18} />Compare</Link>
            <Link href="/cart" onClick={close} className="flex flex-col items-center gap-1 py-3 text-[10px] text-autox-gray"><span className="relative"><ShoppingCart size={18} />{cartCount > 0 && <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-autox-red text-[9px] text-white">{cartCount}</span>}</span>Cart</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
