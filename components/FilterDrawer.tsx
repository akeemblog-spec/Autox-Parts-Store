"use client";

import { X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FilterSidebar, FilterGroup } from "./FilterSidebar";

interface FilterDrawerProps {
  open: boolean; onClose: () => void; groups: FilterGroup[]; selected: Record<string, string[]>; onToggle: (groupId: string, value: string) => void;
  priceMin: number; priceMax: number; priceBound: number; onPriceChange: (max: number) => void; onApply: () => void; onClear: () => void;
}

export function FilterDrawer(props: FilterDrawerProps) {
  const { open, onClose } = props;
  return <div className={cn("fixed inset-0 z-[320] lg:hidden transition-opacity duration-300", open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")}>
    <button aria-label="Close filters overlay" className="absolute inset-0 bg-black/72 backdrop-blur-[2px]" onClick={onClose}/>
    <section role="dialog" aria-modal="true" aria-label="Product filters" className={cn("absolute inset-x-2 bottom-2 flex max-h-[88dvh] flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#101012] shadow-[0_-24px_80px_rgba(0,0,0,.7)] transition-transform duration-300", open ? "translate-y-0" : "translate-y-full")} style={{paddingBottom:"env(safe-area-inset-bottom)"}}>
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/15"/>
      <header className="flex shrink-0 items-center justify-between border-b border-white/[.07] px-5 pb-4 pt-3"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-autox-red">Refine results</p><h2 className="mt-1 text-lg font-extrabold text-white">Filter Products</h2></div><button aria-label="Close filters" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[.035] text-zinc-300"><X size={19}/></button></header>
      <div className="autox-overlay-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4"><FilterSidebar {...props} onApply={() => { props.onApply(); onClose(); }}/></div>
    </section>
  </div>;
}

export function FilterDrawerTrigger({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[.02] px-4 text-xs font-bold uppercase tracking-wide text-white lg:hidden"><SlidersHorizontal size={15}/>Filters</button>;
}
