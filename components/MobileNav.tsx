"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, GitCompareArrows, Heart, Menu, PackageSearch, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SearchBar } from "./SearchBar";
import { getCachedCatalogOptions, loadCatalogOptions } from "@/lib/client/storefront-cache";

type BrandOption = { id: string; label: string; value: string; vehicleType: string };
type CategoryOption = { id: string; label: string; value: string };
type NavGroup = { id: string; label: string; href: string; children?: { label: string; href: string }[] };

export function MobileNav({ wishlistCount = 0, compareCount = 0 }: { cartCount?: number; wishlistCount?: number; compareCount?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const cached = getCachedCatalogOptions();
  const [brands, setBrands] = useState<BrandOption[]>((cached?.brands ?? []) as BrandOption[]);
  const [categories, setCategories] = useState<CategoryOption[]>((cached?.categories ?? []) as CategoryOption[]);

  useEffect(() => { loadCatalogOptions().then((d) => { if (d) { setBrands((d.brands ?? []) as BrandOption[]); setCategories((d.categories ?? []) as CategoryOption[]); } }); }, []);
  useEffect(() => { const previous = document.body.style.overflow; if (open) document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = previous; }; }, [open]);

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
  const countLabel = (count: number) => count > 99 ? "99+" : count;

  return <div className="lg:hidden">
    <button aria-label="Open menu" onClick={() => setOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/[.05]"><Menu size={22}/></button>
    <div className={cn("fixed inset-0 z-[300] transition-opacity duration-300", open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")}>
      <button aria-label="Close menu overlay" className="absolute inset-0 bg-black/80 backdrop-blur-[3px]" onClick={close}/>
      <aside className={cn("absolute left-0 top-0 flex h-[100dvh] w-[88%] max-w-sm flex-col border-r border-white/10 bg-[#0d0d0f] shadow-2xl transition-transform duration-300", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <div><span className="text-xl font-extrabold tracking-tight text-white">AUTO<span className="text-autox-red">X</span></span><p className="mt-0.5 text-[9px] font-bold uppercase tracking-[.22em] text-zinc-600">Explore the store</p></div>
          <button aria-label="Close menu" onClick={close} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[.035] text-zinc-300"><X size={19}/></button>
        </div>
        <div className="shrink-0 border-b border-white/10 p-4"><SearchBar mobile onNavigate={close}/></div>
        <nav className="autox-overlay-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain py-2" aria-label="Mobile menu">
          {groups.map((group) => {
            const hasChildren = Boolean(group.children?.length);
            const isOpen = expanded === group.id;
            const active = pathname === group.href || (group.href !== "/" && pathname.startsWith(group.href));
            return <div key={group.id} className="border-b border-white/[.065]">
              <div className={cn("flex min-h-12 items-center border-l-2 transition-colors", active ? "border-autox-red bg-autox-red/[.055]" : "border-transparent")}>
                <Link href={group.href} onClick={close} className={cn("min-w-0 flex-1 px-4 py-3.5 text-sm font-semibold", active ? "text-white" : "text-zinc-300")}>{group.label}</Link>
                {hasChildren && <button type="button" aria-label={`${isOpen ? "Collapse" : "Expand"} ${group.label}`} aria-expanded={isOpen} onClick={() => setExpanded((v) => v === group.id ? null : group.id)} className="mr-2 flex h-11 w-11 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/[.04] hover:text-white"><ChevronDown size={17} className={cn("transition-transform duration-300", isOpen && "rotate-180")}/></button>}
              </div>
              {hasChildren && <div className={cn("grid overflow-hidden bg-black/25 transition-[grid-template-rows] duration-300", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}><div className="min-h-0 overflow-hidden"><div className="border-t border-white/[.055] py-1.5">{group.children!.map((child) => <Link key={child.href} href={child.href} onClick={close} className="flex min-h-11 items-center px-7 text-[13px] text-zinc-500 transition-colors hover:bg-white/[.035] hover:text-white">{child.label}</Link>)}<Link href={group.href} onClick={close} className="flex min-h-11 items-center gap-2 px-7 text-xs font-black uppercase tracking-wide text-autox-red"><PackageSearch size={14}/>View all {group.label}</Link></div></div></div>}
            </div>;
          })}
        </nav>
        <div className="grid shrink-0 grid-cols-3 border-t border-white/10 bg-[#0a0a0c] p-2" style={{paddingBottom:"calc(.5rem + env(safe-area-inset-bottom))"}}>
          <Link href="/wishlist" onClick={close} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold text-zinc-400 hover:bg-white/[.035] hover:text-white"><span className="relative"><Heart size={19}/>{wishlistCount > 0 && <span className="autox-count-badge absolute -right-2.5 -top-2">{countLabel(wishlistCount)}</span>}</span>Wishlist</Link>
          <Link href="/compare" onClick={close} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold text-zinc-400 hover:bg-white/[.035] hover:text-white"><span className="relative"><GitCompareArrows size={19}/>{compareCount > 0 && <span className="autox-count-badge absolute -right-2.5 -top-2">{compareCount}</span>}</span>Compare</Link>
          <Link href="/orders/track" onClick={close} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold text-zinc-400 hover:bg-white/[.035] hover:text-white"><PackageSearch size={19}/>Track Order</Link>
        </div>
      </aside>
    </div>
  </div>;
}
