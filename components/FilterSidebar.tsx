"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils/cn";

export interface FilterGroupOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  title: string;
  options: FilterGroupOption[];
}

interface FilterSidebarProps {
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

export function FilterSidebar({
  groups,
  selected,
  onToggle,
  priceMax,
  priceBound,
  onPriceChange,
  onApply,
  onClear,
}: FilterSidebarProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(groups.map((g) => [g.id, true]))
  );

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wide">Filters</h2>
        <button onClick={onClear} className="text-xs text-autox-red hover:underline">
          Clear All
        </button>
      </div>

      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.id} className="border-b border-autox-border pb-4">
            <button
              className="flex w-full items-center justify-between text-xs font-bold text-white uppercase tracking-wide mb-3"
              onClick={() => setOpenGroups((s) => ({ ...s, [group.id]: !s[group.id] }))}
              aria-expanded={openGroups[group.id]}
            >
              {group.title}
              <ChevronDown size={14} className={cn("transition-transform", openGroups[group.id] && "rotate-180")} />
            </button>
            {openGroups[group.id] && (
              <ul className="space-y-2">
                {group.options.map((opt) => (
                  <li key={opt.value}>
                    <label className="flex items-center justify-between gap-2 text-sm text-autox-gray cursor-pointer group">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selected[group.id]?.includes(opt.value) ?? false}
                          onChange={() => onToggle(group.id, opt.value)}
                          className="w-4 h-4 rounded border-autox-border bg-autox-panel3 accent-autox-red"
                        />
                        <span className="group-hover:text-white transition-colors">{opt.label}</span>
                      </span>
                      {typeof opt.count === "number" && <span className="text-xs">({opt.count})</span>}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div className="border-b border-autox-border pb-5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wide mb-3">Price Range</h3>
          <input
            type="range"
            min={0}
            max={priceBound}
            step={500}
            value={priceMax}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="w-full accent-autox-red"
            aria-label="Maximum price"
          />
          <div className="flex justify-between text-xs text-autox-gray mt-2">
            <span>LKR 0</span>
            <span>LKR {priceMax.toLocaleString()}+</span>
          </div>
        </div>
      </div>

      <Button onClick={onApply} className="w-full mt-5">
        Apply Filters
      </Button>
    </aside>
  );
}
