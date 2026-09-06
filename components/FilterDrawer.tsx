"use client";

import { X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FilterSidebar, FilterGroup } from "./FilterSidebar";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  groups: FilterGroup[];
  selected: Record<string, string[]>;
  onToggle: (groupId: string, value: string) => void;
  priceMin: number;
  priceMax: number;
  priceBound: number;
  onPriceChange: (max: number) => void;
  onApply: () => void;
  onClear: () => void;
}

export function FilterDrawer(props: FilterDrawerProps) {
  const { open, onClose } = props;
  return (
    <div className={cn("fixed inset-0 z-[100] lg:hidden transition-opacity duration-300", open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-autox-panel2 border-t border-autox-border rounded-t-lg transition-transform duration-300 p-5",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-white uppercase tracking-wide">Filter Products</span>
          <button aria-label="Close filters" onClick={onClose} className="p-1 text-white">
            <X size={20} />
          </button>
        </div>
        <FilterSidebar {...props} onApply={() => { props.onApply(); onClose(); }} />
      </div>
    </div>
  );
}

export function FilterDrawerTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden flex items-center gap-2 h-9 px-4 rounded-sm border border-autox-border text-xs font-bold uppercase tracking-wide text-white"
    >
      <SlidersHorizontal size={14} /> Filters
    </button>
  );
}
