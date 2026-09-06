"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export function Carousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="relative group/carousel">
      <button
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-autox-panel2 border border-autox-border items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:border-autox-red"
      >
        <ChevronLeft size={18} />
      </button>
      <div ref={ref} className="flex gap-4 overflow-x-auto scroll-smooth snap-x pb-1 [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      <button
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-autox-panel2 border border-autox-border items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:border-autox-red"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
