"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Truck, CreditCard, RotateCw, Sparkles, ArrowRight, Scan } from "lucide-react";
import { ButtonLink } from "./ui/Button";
import { cn } from "@/lib/utils/cn";

const features = [
  { icon: ShieldCheck, title: "100%", subtitle: "Genuine Parts", detail: "Quality you can trust" },
  { icon: Truck, title: "Fast", subtitle: "Islandwide Delivery", detail: "Reliable delivery across Sri Lanka" },
  { icon: CreditCard, title: "Easy", subtitle: "Installment Plans", detail: "Flexible ways to pay" },
  { icon: RotateCw, title: "7 Days", subtitle: "Hassle-Free Returns", detail: "Simple, worry-free returns" },
];

type Slide = {
  id: string; eyebrow: string | null; headline: string; headlineAccent: string | null; description: string | null;
  image: string; mobileImage: string | null; primaryLabel: string; primaryHref: string; secondaryLabel: string | null; secondaryHref: string | null;
};

export function Hero({ slides, autoplay = true, interval = 5000, pauseOnHover = true }: { slides: Slide[]; autoplay?: boolean; interval?: number; pauseOnHover?: boolean }) {
  const safeSlides = useMemo(() => slides.length ? slides : [{ id: "fallback", eyebrow: null, headline: "Genuine Parts.", headlineAccent: "Peak Performance.", description: "High quality motorcycle and three wheeler parts for every ride. Built to perform. Built to last.", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200&auto=format&fit=crop", mobileImage: null, primaryLabel: "Shop Parts", primaryHref: "/products", secondaryLabel: "Parts Finder", secondaryHref: "/parts-finder" }], [slides]);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = safeSlides[slide % safeSlides.length];

  useEffect(() => {
    if (!autoplay || paused || safeSlides.length < 2) return;
    const timer = window.setInterval(() => setSlide((s) => (s + 1) % safeSlides.length), Math.max(2000, interval));
    return () => window.clearInterval(timer);
  }, [autoplay, interval, paused, safeSlides.length]);

  return (
    <section className="relative overflow-hidden border-b border-autox-border bg-black" onMouseEnter={() => pauseOnHover && setPaused(true)} onMouseLeave={() => pauseOnHover && setPaused(false)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(237,28,36,0.16),transparent_60%)]" />
      <div className="relative mx-auto max-w-[1600px] px-4 lg:px-6">
        <div className="grid items-center gap-6 py-10 lg:grid-cols-[1fr_1.2fr_260px] lg:py-16">
          <div key={active.id + "-copy"} className="relative z-10 animate-fadeUp">
            {active.eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-autox-red">{active.eyebrow}</p>}
            <h1 className="text-3xl font-extrabold leading-[1.05] text-white sm:text-4xl lg:text-[2.75rem]">
              {active.headline}<br />{active.headlineAccent && <span className="text-autox-red">{active.headlineAccent}</span>}
            </h1>
            {active.description && <p className="mt-4 max-w-md text-sm text-autox-gray lg:text-base">{active.description}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ButtonLink href={active.primaryHref} size="md">{active.primaryLabel} <ArrowRight size={16} /></ButtonLink>
              {active.secondaryLabel && active.secondaryHref && <ButtonLink href={active.secondaryHref} variant="outline" size="md"><Scan size={16} /> {active.secondaryLabel}</ButtonLink>}
            </div>
            <ButtonLink href="/parts-finder" variant="outline" size="sm" className="mt-5 w-fit"><Sparkles size={13} /> Need help finding a part? Use Parts Finder <ArrowRight size={13} /></ButtonLink>
          </div>

          <div key={active.id + "-image"} className="relative order-first flex items-center justify-center py-6 lg:order-none lg:py-0">
            <span aria-hidden className="absolute select-none text-[10rem] font-black leading-none text-autox-red/10 sm:text-[14rem] lg:text-[18rem]" style={{ WebkitTextStroke: "1px rgba(237,28,36,0.35)" }}>X</span>
            <picture className="relative z-10 block w-full max-w-xl">
              {active.mobileImage && <source media="(max-width: 767px)" srcSet={active.mobileImage} />}
              <img src={active.image} alt={active.headline} className="w-full object-contain drop-shadow-[0_20px_60px_rgba(237,28,36,0.35)]" />
            </picture>
          </div>

          <div className="hidden grid-cols-1 gap-3 lg:grid">
            {features.map((f) => (
              <div
                key={f.subtitle}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] px-4 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-autox-red/45 hover:bg-white/[0.055]"
              >
                <span aria-hidden className="absolute inset-y-0 left-0 w-[2px] bg-autox-red/80 opacity-70 transition-opacity group-hover:opacity-100" />
                <div className="flex items-center gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-autox-red/25 bg-autox-red/10 text-autox-red transition-colors group-hover:bg-autox-red group-hover:text-white">
                    <f.icon size={19} strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1.5 leading-none">
                      <span className="text-sm font-black uppercase tracking-tight text-white">{f.title}</span>
                    </div>
                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">{f.subtitle}</div>
                    <div className="mt-1 hidden text-[10px] leading-snug text-autox-gray xl:block">{f.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {safeSlides.length > 1 && <div className="flex justify-center gap-2 pb-4 lg:hidden">{safeSlides.map((s, i) => <button key={s.id} aria-label={`Go to slide ${i + 1}`} onClick={() => setSlide(i)} className={cn("relative h-1.5 overflow-hidden rounded-full bg-autox-border transition-all duration-300", i === slide ? "w-10" : "w-3")}>{i === slide && <span key={`${slide}-${paused}`} className={cn("absolute inset-y-0 left-0 bg-autox-red", autoplay && !paused ? "animate-[heroProgress_linear_forwards]" : "w-full")} style={autoplay && !paused ? ({ animationDuration: `${Math.max(2000, interval)}ms` } as React.CSSProperties) : undefined} />}</button>)}</div>}
        <div className="grid grid-cols-2 gap-2.5 pb-6 lg:hidden">
          {features.map((f) => (
            <div
              key={f.subtitle}
              className="relative min-h-[86px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] p-3.5 shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-autox-red/55 to-transparent" />
              <span className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg border border-autox-red/25 bg-autox-red/10 text-autox-red">
                <f.icon size={16} strokeWidth={2.1} />
              </span>
              <div className="text-[12px] font-black uppercase leading-none tracking-tight text-white">{f.title}</div>
              <div className="mt-1.5 text-[8px] font-semibold uppercase leading-tight tracking-[0.11em] text-white/60">{f.subtitle}</div>
            </div>
          ))}
        </div>
        {safeSlides.length > 1 && <div className="hidden justify-center gap-2 pb-8 lg:flex">{safeSlides.map((s, i) => <button key={s.id} aria-label={`Go to slide ${i + 1}`} onClick={() => setSlide(i)} className={cn("relative h-1.5 overflow-hidden rounded-full bg-autox-border transition-all duration-300", i === slide ? "w-10" : "w-3")}>{i === slide && <span key={`${slide}-${paused}`} className={cn("absolute inset-y-0 left-0 bg-autox-red", autoplay && !paused ? "animate-[heroProgress_linear_forwards]" : "w-full")} style={autoplay && !paused ? ({ animationDuration: `${Math.max(2000, interval)}ms` } as React.CSSProperties) : undefined} />}</button>)}</div>}
      </div>
    </section>
  );
}
