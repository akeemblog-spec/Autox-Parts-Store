"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Truck, CreditCard, Scan } from "lucide-react";
import { ButtonLink } from "./ui/Button";
import { cn } from "@/lib/utils/cn";

const trustPoints = [
  { icon: ShieldCheck, label: "Genuine Parts" },
  { icon: Truck, label: "Islandwide Delivery" },
  { icon: CreditCard, label: "Secure Checkout" },
];

type Slide = {
  id: string; eyebrow: string | null; headline: string; headlineAccent: string | null; description: string | null;
  image: string; mobileImage: string | null; primaryLabel: string; primaryHref: string; secondaryLabel: string | null; secondaryHref: string | null;
};

export function Hero({ slides, autoplay = true, interval = 5000, pauseOnHover = true }: { slides: Slide[]; autoplay?: boolean; interval?: number; pauseOnHover?: boolean }) {
  const safeSlides = useMemo(() => slides.length ? slides : [{ id: "fallback", eyebrow: "Genuine performance parts", headline: "Find the Right Part.", headlineAccent: "Ride With Confidence.", description: "Premium motorcycle and three-wheeler parts for riders who expect better fit, quality and reliability.", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200&auto=format&fit=crop", mobileImage: null, primaryLabel: "Shop Parts", primaryHref: "/products", secondaryLabel: "Find My Part", secondaryHref: "/parts-finder" }], [slides]);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = safeSlides[slide % safeSlides.length];

  useEffect(() => {
    if (!autoplay || paused || safeSlides.length < 2) return;
    const timer = window.setInterval(() => setSlide((s) => (s + 1) % safeSlides.length), Math.max(2500, interval));
    return () => window.clearInterval(timer);
  }, [autoplay, interval, paused, safeSlides.length]);

  const go = (direction: number) => setSlide((current) => (current + direction + safeSlides.length) % safeSlides.length);

  return (
    <section className="relative isolate overflow-hidden bg-[#050506]" onMouseEnter={() => pauseOnHover && setPaused(true)} onMouseLeave={() => pauseOnHover && setPaused(false)}>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_74%_46%,rgba(237,28,36,.22),transparent_31%),radial-gradient(circle_at_13%_25%,rgba(255,255,255,.05),transparent_26%),linear-gradient(180deg,#050506_0%,#08080a_100%)]" />
      <div aria-hidden className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] [background-size:46px_46px] [mask-image:linear-gradient(to_right,black,transparent_86%)]" />
      <div aria-hidden className="absolute -right-32 top-[45%] h-[430px] w-[430px] -translate-y-1/2 rounded-full border border-autox-red/10 sm:h-[560px] sm:w-[560px] lg:right-[4%] lg:h-[700px] lg:w-[700px]" />
      <div aria-hidden className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/45 to-transparent" />

      <div className="relative mx-auto max-w-[1600px] px-4 lg:px-6">
        <div className="grid min-h-[610px] items-center gap-4 pt-7 pb-4 sm:min-h-[660px] sm:pt-9 lg:min-h-[640px] lg:grid-cols-[minmax(0,.92fr)_minmax(500px,1.08fr)] lg:gap-10 lg:pt-12 xl:min-h-[680px]">
          <div key={`${active.id}-copy`} className="z-20 order-1 max-w-2xl animate-fadeUp text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-autox-red/[.09] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.2em] text-autox-red ring-1 ring-inset ring-autox-red/20 sm:text-xs">
              <Sparkles size={13} /> {active.eyebrow || "Genuine performance parts"}
            </div>
            <h1 className="text-[2.25rem] font-black leading-[.98] tracking-[-.045em] text-white sm:text-5xl lg:text-[3.9rem] xl:text-[4.65rem]">
              {active.headline}
              {active.headlineAccent && <><br/><span className="text-autox-red">{active.headlineAccent}</span></>}
            </h1>
            {active.description && <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base sm:leading-7 lg:mx-0 lg:max-w-lg">{active.description}</p>}
            <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row lg:justify-start">
              <ButtonLink href={active.primaryHref} size="md" className="min-h-12 justify-center rounded-xl px-6 shadow-[0_12px_30px_rgba(237,28,36,.18)]">{active.primaryLabel}<ArrowRight size={16}/></ButtonLink>
              {active.secondaryLabel && active.secondaryHref && <ButtonLink href={active.secondaryHref} variant="outline" size="md" className="min-h-12 justify-center rounded-xl border-white/12 bg-white/[.035] px-6 backdrop-blur"><Scan size={16}/>{active.secondaryLabel}</ButtonLink>}
            </div>
            <div className="mx-auto mt-7 grid max-w-xl grid-cols-3 divide-x divide-white/[.08] rounded-2xl bg-white/[.035] py-3 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur-sm lg:mx-0">
              {trustPoints.map(({ icon: Icon, label }) => <div key={label} className="flex min-w-0 flex-col items-center gap-1.5 px-2 text-center sm:flex-row sm:justify-center sm:text-left"><Icon size={16} className="shrink-0 text-autox-red"/><span className="text-[9px] font-bold leading-tight text-zinc-300 sm:text-[11px]">{label}</span></div>)}
            </div>
          </div>

          <div key={`${active.id}-image`} className="relative order-2 flex min-h-[250px] items-center justify-center sm:min-h-[320px] lg:min-h-[500px]">
            <div aria-hidden className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-autox-red/[.11] blur-3xl"/>
            <div aria-hidden className="absolute bottom-[7%] left-1/2 h-[24px] w-[58%] -translate-x-1/2 rounded-full bg-black/80 blur-xl"/>
            <span aria-hidden className="absolute right-[1%] top-[3%] select-none text-[7rem] font-black leading-none text-white/[.025] sm:text-[10rem] lg:text-[15rem]" style={{ WebkitTextStroke: "1px rgba(237,28,36,.13)" }}>X</span>
            <picture className="relative z-10 block w-full max-w-[740px]">
              {active.mobileImage && <source media="(max-width: 767px)" srcSet={active.mobileImage}/>} 
              <img src={active.image} alt={active.headline} className="mx-auto max-h-[325px] w-full object-contain drop-shadow-[0_28px_70px_rgba(237,28,36,.24)] sm:max-h-[405px] lg:max-h-[525px]"/>
            </picture>
          </div>
        </div>

        {safeSlides.length > 1 && (
          <div className="relative z-30 flex min-h-16 items-center justify-center gap-5 pb-5 sm:justify-between lg:pb-7">
            <div className="flex items-center gap-2.5 rounded-full bg-black/35 px-3 py-2 backdrop-blur-md ring-1 ring-inset ring-white/[.06]">
              {safeSlides.map((s, i) => (
                <button key={s.id} type="button" aria-label={`Go to slide ${i + 1}`} aria-current={i === slide ? "true" : undefined} onClick={() => setSlide(i)} className={cn("relative h-2 overflow-hidden rounded-full transition-all duration-300", i === slide ? "w-14 bg-white/15" : "w-5 bg-white/30 hover:bg-white/50")}>
                  {i === slide && <span key={`${slide}-${paused}`} className={cn("absolute inset-y-0 left-0 rounded-full bg-autox-red shadow-[0_0_12px_rgba(237,28,36,.55)]", autoplay && !paused ? "animate-[heroProgress_linear_forwards]" : "w-full")} style={autoplay && !paused ? ({ animationDuration: `${Math.max(2500, interval)}ms` } as React.CSSProperties) : undefined}/>} 
                </button>
              ))}
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="mr-2 text-[10px] font-black uppercase tracking-[.18em] text-zinc-600">{String(slide + 1).padStart(2, "0")} / {String(safeSlides.length).padStart(2, "0")}</span>
              <button type="button" aria-label="Previous hero slide" onClick={() => go(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[.055] text-zinc-300 ring-1 ring-inset ring-white/[.08] backdrop-blur transition hover:bg-white/[.1] hover:text-white"><ArrowLeft size={17}/></button>
              <button type="button" aria-label="Next hero slide" onClick={() => go(1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-autox-red text-white shadow-[0_8px_24px_rgba(237,28,36,.22)] transition hover:bg-red-600"><ArrowRight size={17}/></button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
