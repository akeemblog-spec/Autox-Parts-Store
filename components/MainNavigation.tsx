"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getCachedCatalogOptions, loadCatalogOptions } from "@/lib/client/storefront-cache";

type BrandOption = { id: string; label: string; value: string; vehicleType: string };
type CategoryOption = { id: string; label: string; value: string };

const baseLinks = [
  { id: "nav-home", label: "Home", href: "/" },
  { id: "nav-brands", label: "Brands", href: "/brands" },
  { id: "nav-parts-finder", label: "Parts Finder", href: "/parts-finder" },
  { id: "nav-services", label: "Services", href: "/services" },
  { id: "nav-offers", label: "Offers", href: "/offers" },
  { id: "nav-contact", label: "Contact", href: "/contact" },
];

export function MainNavigation() {
  const pathname = usePathname();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const cached = getCachedCatalogOptions();
  const [brands, setBrands] = useState<BrandOption[]>((cached?.brands ?? []) as BrandOption[]);
  const [categories, setCategories] = useState<CategoryOption[]>((cached?.categories ?? []) as CategoryOption[]);

  useEffect(() => {
    let mounted = true;
    loadCatalogOptions().then((d) => {
      if (!mounted || !d) return;
      setBrands((d.brands ?? []) as BrandOption[]);
      setCategories((d.categories ?? []) as CategoryOption[]);
    });
    return () => { mounted = false; };
  }, []);

  const links = useMemo(() => {
    const bikeBrands = brands.filter((b) => b.vehicleType === "bike").map((b) => ({ label: b.label, href: `/brands/${b.value}` }));
    const threeWheelBrands = brands.filter((b) => b.vehicleType === "three-wheeler").map((b) => ({ label: b.label, href: `/brands/${b.value}` }));
    return [
      baseLinks[0],
      { id: "nav-bikes", label: "Bikes", href: "/bikes", children: bikeBrands },
      { id: "nav-three-wheelers", label: "Three Wheelers", href: "/three-wheelers", children: threeWheelBrands },
      ...baseLinks.slice(1),
    ];
  }, [brands]);

  return (
    <div className="relative z-[140] hidden border-b border-autox-border bg-autox-panel lg:block">
      <div className="mx-auto flex h-12 max-w-[1600px] items-center gap-2 px-6 overflow-visible">
        <div className="relative shrink-0">
          <button onClick={() => setCategoriesOpen((v) => !v)} className="flex h-9 items-center gap-2 rounded-xl bg-autox-red px-4 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-autox-redDark" aria-expanded={categoriesOpen}>
            <Menu size={15} /> All Categories <ChevronDown size={13} className={cn("transition-transform", categoriesOpen && "rotate-180")} />
          </button>
          {categoriesOpen && (
            <div className="absolute left-0 top-full z-[140] mt-1 max-h-[70vh] w-60 overflow-y-auto rounded-xl border border-autox-border bg-autox-panel2 py-2 shadow-2xl">
              <Link href="/categories" onClick={() => setCategoriesOpen(false)} className="block px-4 py-2 text-sm font-semibold text-white hover:bg-autox-panel3">All Parts</Link>
              {categories.map((c) => <Link key={c.id} href={`/categories/${c.value}`} onClick={() => setCategoriesOpen(false)} className="block px-4 py-2 text-sm text-autox-gray transition-colors hover:bg-autox-panel3 hover:text-white">{c.label}</Link>)}
            </div>
          )}
        </div>

        <nav aria-label="Main navigation" className="hidden min-w-0 items-center gap-1 overflow-visible lg:flex">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <div key={link.id} className="group relative shrink-0">
                <Link href={link.href} className={cn("flex h-9 items-center gap-1 border-b-2 px-3 text-xs font-bold uppercase tracking-wide transition-colors", active ? "border-autox-red text-white" : "border-transparent text-autox-gray hover:text-white")}>{link.label}{"children" in link && link.children && link.children.length > 0 && <ChevronDown size={12} />}</Link>
                {"children" in link && link.children && link.children.length > 0 && (
                  <div className="absolute left-0 top-full z-[140] hidden min-w-52 max-h-[70vh] overflow-y-auto rounded-xl border border-autox-border bg-autox-panel2 py-2 shadow-2xl group-hover:block">
                    {link.children.map((child) => <Link key={child.href} href={child.href} className="block whitespace-nowrap px-4 py-2 text-sm text-autox-gray transition-colors hover:bg-autox-panel3 hover:text-white">{child.label}</Link>)}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
