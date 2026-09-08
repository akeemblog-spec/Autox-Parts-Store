"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Grid2X2, Home, PackageSearch, Search, ShoppingCart, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SearchBar } from "@/components/SearchBar";
import { getCachedCatalogOptions, loadCatalogOptions } from "@/lib/client/storefront-cache";

type CategoryOption = { id: string; label: string; value: string };
type Panel = "categories" | "search" | null;

export function MobileFloatingNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && Boolean(session?.user?.id) && !session?.user?.invalidated;
  const accountHref = isAuthenticated ? "/account" : "/login";
  const cached = getCachedCatalogOptions();
  const [categories, setCategories] = useState<CategoryOption[]>((cached?.categories ?? []) as CategoryOption[]);
  const [panel, setPanel] = useState<Panel>(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartPulse, setCartPulse] = useState(false);

  useEffect(() => { loadCatalogOptions().then((data) => { if (data) setCategories((data.categories ?? []) as CategoryOption[]); }); }, []);
  useEffect(() => {
    if (!panel) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setPanel(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKeyDown); };
  }, [panel]);
  useEffect(() => {
    if (!isAuthenticated) return;
    let mounted = true;
    const refreshCart = async () => {
      try {
        const response = await fetch("/api/cart", { cache: "no-store" });
        if (!response.ok || !mounted) return;
        const cart = await response.json();
        setCartCount((cart.items ?? []).reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity ?? 0), 0));
      } catch { /* keep last known count */ }
    };
    const onUpdated = () => { refreshCart(); setCartPulse(false); requestAnimationFrame(() => setCartPulse(true)); window.setTimeout(() => setCartPulse(false), 450); };
    refreshCart();
    window.addEventListener("autox-cart-updated", onUpdated);
    return () => { mounted = false; window.removeEventListener("autox-cart-updated", onUpdated); };
  }, [isAuthenticated, session?.user?.id]);

  const visibleCartCount = isAuthenticated ? cartCount : 0;
  const navItems = useMemo(() => [
    { id: "home", label: "Home", href: "/", icon: Home, active: pathname === "/" },
    { id: "categories", label: "Categories", icon: Grid2X2, active: panel === "categories" || pathname === "/categories" || pathname.startsWith("/categories/"), action: () => setPanel("categories") },
    { id: "search", label: "Search", icon: Search, active: panel === "search", action: () => setPanel("search") },
    { id: "account", label: "Account", href: accountHref, icon: UserRound, active: pathname.startsWith("/account") || pathname.startsWith("/orders/track") || (!isAuthenticated && pathname.startsWith("/login")) },
    { id: "cart", label: "Cart", href: "/cart", icon: ShoppingCart, active: pathname.startsWith("/cart") },
  ], [accountHref, isAuthenticated, panel, pathname]);

  return <>
    <nav aria-label="Mobile storefront navigation" className="fixed inset-x-3 z-[220] lg:hidden" style={{ bottom: "calc(10px + env(safe-area-inset-bottom))" }}>
      <div className="mx-auto max-w-md rounded-[22px] border border-white/10 bg-[#0b0b0d]/96 p-1.5 shadow-[0_14px_42px_rgba(0,0,0,.52),inset_0_1px_0_rgba(255,255,255,.035)] backdrop-blur-xl">
        <div className="grid grid-cols-5 gap-0.5">
          {navItems.map(({ id, label, href, icon: Icon, active, action }) => {
            const content = <><span className={cn("relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200", active ? "bg-autox-red/14 text-autox-red ring-1 ring-autox-red/25" : "text-zinc-400")}> <Icon size={19} strokeWidth={active ? 2.35 : 2}/>{id === "cart" && visibleCartCount > 0 && <span className={cn("autox-count-badge absolute -right-1.5 -top-1.5", cartPulse && "autox-count-pop")}>{visibleCartCount > 99 ? "99+" : visibleCartCount}</span>}</span><span className={cn("mt-1 text-[10px] font-bold tracking-tight", active ? "text-white" : "text-zinc-500")}>{label}</span></>;
            const className = "flex min-h-[54px] min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-1 transition-colors active:bg-white/[.035]";
            return href ? <Link key={id} href={href} aria-current={active ? "page" : undefined} className={className}>{content}</Link> : <button key={id} type="button" aria-label={`Open ${label}`} aria-expanded={panel === id} onClick={action} className={className}>{content}</button>;
          })}
        </div>
      </div>
    </nav>

    <div className={cn("fixed inset-0 z-[310] lg:hidden", panel ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!panel}>
      <button type="button" aria-label="Close navigation panel" onClick={() => setPanel(null)} className={cn("absolute inset-0 bg-black/72 backdrop-blur-[3px] transition-opacity duration-200", panel ? "opacity-100" : "opacity-0")}/>
      <section role="dialog" aria-modal="true" aria-label={panel === "search" ? "Search AutoX" : "Browse categories"} className={cn("absolute inset-x-2 bottom-2 max-h-[84dvh] overflow-hidden rounded-[28px] border border-white/10 bg-[#101012] shadow-[0_-24px_80px_rgba(0,0,0,.72)] transition-all duration-300", panel ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0")} style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/15"/>
        <div className="flex items-center justify-between px-5 pb-4 pt-3">
          <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-autox-red">AUTOX</p><h2 className="mt-1 text-lg font-extrabold text-white">{panel === "search" ? "Find your part" : "Shop categories"}</h2><p className="mt-1 text-xs text-zinc-500">{panel === "search" ? "Search products, brands and compatible models." : "Jump straight to the parts you need."}</p></div>
          <button type="button" onClick={() => setPanel(null)} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[.035] text-zinc-300 hover:text-white"><X size={18}/></button>
        </div>
        {panel === "search" ? <div className="px-4 pb-5"><div className="rounded-2xl border border-white/10 bg-black/35 p-3"><SearchBar mobile autoFocus onNavigate={() => setPanel(null)}/><div className="mt-3 flex items-start gap-2 rounded-xl bg-white/[.025] px-3 py-2.5 text-[11px] leading-5 text-zinc-500"><PackageSearch size={15} className="mt-0.5 shrink-0 text-autox-red"/>Type at least 3 characters to search the live AutoX catalog.</div></div></div> : <div className="autox-overlay-scroll relative max-h-[62dvh] overflow-y-auto px-4 pb-7"><Link href="/categories" onClick={() => setPanel(null)} className="mb-3 flex min-h-14 items-center justify-between rounded-2xl border border-autox-red/30 bg-autox-red/10 px-4 py-3 text-sm font-bold text-white"><span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-autox-red text-white"><Grid2X2 size={17}/></span>All Parts</span><span className="text-xs font-black text-autox-red">VIEW ALL</span></Link><div className="grid grid-cols-2 gap-2.5">{categories.map((category) => <Link key={category.id} href={`/categories/${category.value}`} onClick={() => setPanel(null)} className="group flex min-h-20 items-center gap-3 rounded-2xl border border-white/[.075] bg-white/[.025] p-3 hover:border-autox-red/50 hover:bg-autox-red/[.06]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/45 text-zinc-400 group-hover:text-autox-red"><PackageSearch size={18}/></span><span className="line-clamp-2 text-xs font-bold leading-4 text-zinc-200">{category.label}</span></Link>)}</div>{categories.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs text-zinc-500">Loading categories…</div>}<div aria-hidden className="pointer-events-none sticky bottom-0 mt-[-18px] h-7 bg-gradient-to-t from-[#101012] to-transparent"/></div>}
      </section>
    </div>
  </>;
}
