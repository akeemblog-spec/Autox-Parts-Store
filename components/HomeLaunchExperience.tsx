"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

function SuperbikeMark() {
  return (
    <svg viewBox="0 0 420 190" role="img" aria-label="Red Ducati-style superbike" className="h-auto w-full">
      <defs>
        <linearGradient id="bike-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff4350" />
          <stop offset="0.48" stopColor="#ed1c24" />
          <stop offset="1" stopColor="#8a0710" />
        </linearGradient>
        <filter id="bike-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g className="autox-loader-bike-body" filter="url(#bike-glow)">
        <circle cx="92" cy="137" r="39" fill="#080809" stroke="#343438" strokeWidth="9" />
        <circle cx="92" cy="137" r="23" fill="none" stroke="#77777d" strokeWidth="3" className="autox-loader-wheel" />
        <circle cx="326" cy="137" r="39" fill="#080809" stroke="#343438" strokeWidth="9" />
        <circle cx="326" cy="137" r="23" fill="none" stroke="#77777d" strokeWidth="3" className="autox-loader-wheel" />
        <path d="M111 124 C140 102 165 94 207 94 L255 105 L290 124 L261 126 L230 111 L177 111 L143 130 Z" fill="url(#bike-red)" />
        <path d="M170 101 C190 69 224 57 268 65 L289 83 L250 89 L222 79 L195 101 Z" fill="url(#bike-red)" />
        <path d="M253 69 L294 68 L310 77 L277 82 Z" fill="#f8f8f8" opacity=".86" />
        <path d="M281 82 L321 112 L313 120 L270 91 Z" fill="#b10d15" />
        <path d="M149 106 L126 75 L134 70 L164 102 Z" fill="#d7d7da" />
        <path d="M128 73 L119 61 L125 58 L139 68 Z" fill="#f3f3f4" />
        <path d="M186 94 L157 82 L171 72 L211 78 Z" fill="#0a0a0c" />
        <path d="M188 113 L213 136 L241 137" fill="none" stroke="#d8d8da" strokeWidth="5" strokeLinecap="round" />
        <path d="M120 128 L151 139 L193 139" fill="none" stroke="#77777d" strokeWidth="4" strokeLinecap="round" />
        <path d="M269 126 L309 135" fill="none" stroke="#77777d" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g className="autox-loader-speed-lines" stroke="#ed1c24" strokeLinecap="round">
        <path d="M20 102 H80" strokeWidth="3" opacity=".8" />
        <path d="M4 119 H61" strokeWidth="2" opacity=".45" />
        <path d="M25 137 H51" strokeWidth="2" opacity=".25" />
      </g>
    </svg>
  );
}

export function HomeLaunchExperience({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const reveal = window.setTimeout(() => setReady(true), 1450);
    const remove = window.setTimeout(() => setShowLoader(false), 1950);
    return () => {
      window.clearTimeout(reveal);
      window.clearTimeout(remove);
    };
  }, []);

  return (
    <>
      {showLoader && (
        <div className={cn("fixed inset-0 z-[300] grid place-items-center overflow-hidden bg-[#050506] transition-all duration-500", ready && "pointer-events-none opacity-0")} aria-live="polite" aria-label="Loading AutoX Parts Store">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_58%,rgba(237,28,36,.2),transparent_28%),radial-gradient(circle_at_50%_110%,rgba(237,28,36,.12),transparent_38%)]" />
          <div aria-hidden className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="relative w-[min(88vw,560px)] text-center">
            <div className="mx-auto w-[min(82vw,450px)] autox-loader-bike"><SuperbikeMark /></div>
            <div className="mt-2 flex items-baseline justify-center gap-2">
              <span className="text-2xl font-black tracking-[-.04em] text-white sm:text-3xl">AUTO<span className="text-autox-red">X</span></span>
              <span className="text-[9px] font-black uppercase tracking-[.28em] text-zinc-600 sm:text-[10px]">Performance Parts</span>
            </div>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[.24em] text-zinc-500">Igniting your ride</p>
            <div className="mx-auto mt-5 h-1 w-48 overflow-hidden rounded-full bg-white/[.07]">
              <span className="block h-full rounded-full bg-autox-red autox-loader-progress" />
            </div>
          </div>
        </div>
      )}
      <div className={cn("transition-[opacity,transform,filter] duration-700 ease-out", ready ? "translate-y-0 opacity-100 blur-0" : "translate-y-2 opacity-0 blur-[2px]")}>{children}</div>
    </>
  );
}
