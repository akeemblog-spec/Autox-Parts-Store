"use client";

import { VehicleModel } from "@/types";
import { cn } from "@/lib/utils/cn";

interface ModelSelectorProps { models: VehicleModel[]; activeId?: string; onSelect?: (id: string) => void; }

export function ModelSelector({ models, activeId, onSelect }: ModelSelectorProps) {
  return (
    <div className="autox-model-scroll flex gap-2 overflow-x-auto px-0.5 py-2 snap-x sm:gap-3">
      {models.map((m) => {
        const active = m.id === activeId;
        return (
          <button key={m.id} onClick={() => onSelect?.(m.id)} className={cn("flex w-[104px] shrink-0 snap-start flex-col items-center rounded-2xl border bg-autox-panel p-2 transition-all duration-200 sm:w-32 sm:p-3", active ? "border-autox-red shadow-cardGlow" : "border-autox-border hover:border-autox-red hover:shadow-[0_0_0_1px_rgba(237,28,36,.35),0_12px_30px_rgba(0,0,0,.28)]")}>
            <div className="mb-1.5 aspect-[4/3] w-full overflow-hidden rounded-xl bg-autox-panel3 sm:mb-2"><img src={m.image} alt={m.name} loading="lazy" decoding="async" className="h-full w-full object-cover" /></div>
            <span className="line-clamp-1 text-[11px] font-bold text-white sm:text-xs">{m.name}</span>
            <span className="text-[9px] text-autox-gray sm:text-[10px]">{m.yearFrom} - {m.yearTo}</span>
          </button>
        );
      })}
    </div>
  );
}
