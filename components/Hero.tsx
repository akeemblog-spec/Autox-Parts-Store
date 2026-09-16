"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, ArrowRight, CreditCard, Scan, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { ButtonLink } from "./ui/Button";
import { cn } from "@/lib/utils/cn";

type Slide = {
  id: string;
  eyebrow: string | null;
  headline: string;
  headlineAccent: string | null;
  description: string | null;
  image: string;
  mobileImage: string | null;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string | null;
  secondaryHref: string | null;
};

const fallback: Slide = {
  id: "fallback", eyebrow: "Genuine performance parts",
  headline: "Find the Right Part.", headlineAccent: "Ride With Confidence.",
  description: "Premium motorcycle and three-wheeler parts for riders who expect better fit, quality and reliability.",
  image: "", mobileImage: null, primaryLabel: "Shop Parts", primaryHref: "/products",
  secondaryLabel: "Find My Part", secondaryHref: "/parts-finder",
};

const trustPoints = [
  { icon: ShieldCheck, label: "Genuine Parts" },
  { icon: Truck, label: "Islandwide Delivery" },
  { icon: CreditCard, label: "Secure Checkout" },
];
const FADE_MS = 260;

export function Hero({ slides, autoplay = true, interval = 5000, pauseOnHover = true }: {
  slides: Slide[]; autoplay?: boolean; interval?: number; pauseOnHover?: boolean;
}) {
  const items = slides.length ? slides : [fallback];
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [changing, setChanging] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const timer = useRef<number | null>(null);
  const busy = useRef(false);
  const currentIndex = Math.min(index, items.length - 1);
  const active = items[currentIndex];
  const paused = changing || (pauseOnHover && hovered);

  const changeTo = useCallback((next: number) => {
    if (items.length < 2 || busy.current || next === currentIndex) return;
    busy.current = true;
    setChanging(true);
    setVisible(false);
    timer.current = window.setTimeout(() => {
      setIndex(next);
      window.requestAnimationFrame(() => {
        setVisible(true);
        timer.current = window.setTimeout(() => {
          busy.current = false;
          setChanging(false);
          timer.current = null;
        }, 460);
      });
    }, FADE_MS);
  }, [items.length, currentIndex]);

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (!autoplay || paused || items.length < 2) return;
    const id = window.setTimeout(() => changeTo((currentIndex + 1) % items.length), Math.max(2500, interval));
    return () => window.clearTimeout(id);
  }, [autoplay, paused, currentIndex, items.length, interval, changeTo]);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.target instanceof Element && event.target.closest("a, button")) return;
    start.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (!start.current) return;
    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;
    start.current = null;
    if (Math.abs(dx) > 54 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      changeTo((currentIndex + (dx < 0 ? 1 : -1) + items.length) % items.length);
    }
  };

  return (
    <section
      className="relative isolate min-h-[760px] touch-pan-y overflow-hidden bg-[#050506] sm:min-h-[800px] lg:h-[600px] lg:min-h-[600px]"
      aria-label="AutoX featured offers"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { start.current = null; }}
    >
      {/* A single fixed picture contains the bike. Slide images from the storefront do not move it. */}
      <picture className="pointer-events-none absolute inset-0 h-full w-full">
        <source media="(max-width: 767px)" srcSet="/images/hero/autox-neon-garage-ducati-mobile.webp" type="image/webp" />
        <source media="(max-width: 1199px)" srcSet="/images/hero/autox-neon-garage-ducati-tablet.webp" type="image/webp" />
        <img
          src="/images/hero/autox-neon-garage-ducati-desktop.webp"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="h-full w-full object-cover object-center"
        />
      </picture>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,3,4,.68)_0%,rgba(3,3,4,.28)_39%,transparent_72%),linear-gradient(0deg,rgba(0,0,0,.7)_0%,transparent_25%)] max-md:bg-[linear-gradient(180deg,rgba(0,0,0,.54)_0%,rgba(0,0,0,.35)_37%,transparent_57%,rgba(0,0,0,.54)_100%)]" />

      <div className="relative mx-auto flex min-h-[760px] max-w-[1600px] flex-col px-4 pb-[125px] pt-10 sm:min-h-[800px] sm:px-6 lg:h-[600px] lg:min-h-[600px] lg:justify-center lg:px-8 lg:pb-[90px] lg:pt-12 xl:px-10">
        <div
          key={active.id}
          aria-live="polite"
          className={cn(
            "relative z-10 max-w-[690px] text-center transition-[opacity,transform] duration-500 ease-out lg:max-w-[490px] lg:text-left xl:max-w-[620px] 2xl:max-w-[690px]",
            visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 pointer-events-none",
          )}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-autox-red/75 bg-black/55 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.2em] text-autox-red shadow-[0_0_13px_rgba(237,28,36,.28)] backdrop-blur-sm sm:text-xs">
            <Sparkles size={13} className="autox-neon-mark" />{active.eyebrow || "Genuine performance parts"}
          </div>
          <h1 className="text-[2.15rem] font-black leading-[1.02] tracking-[-.045em] text-white drop-shadow-[0_3px_16px_rgba(0,0,0,.85)] sm:text-5xl lg:text-[3rem] xl:text-[3.8rem] 2xl:text-[4.45rem]">
            {active.headline}{active.headlineAccent && <><br /><span className="text-autox-red">{active.headlineAccent}</span></>}
          </h1>
          {active.description && <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-200 drop-shadow-[0_2px_10px_rgba(0,0,0,.9)] sm:text-base sm:leading-7 lg:mx-0 lg:max-w-lg">{active.description}</p>}
          <div className="mt-5 flex flex-col justify-center gap-2.5 sm:flex-row lg:justify-start">
            <ButtonLink href={active.primaryHref} size="md" className="min-h-12 justify-center rounded-xl px-6 shadow-[0_12px_30px_rgba(237,28,36,.25)]">{active.primaryLabel}<ArrowRight size={16} /></ButtonLink>
            {active.secondaryLabel && active.secondaryHref && <ButtonLink href={active.secondaryHref} variant="outline" size="md" className="min-h-12 justify-center rounded-xl border-white/25 bg-black/50 px-6 backdrop-blur-sm"><Scan size={16} />{active.secondaryLabel}</ButtonLink>}
          </div>
        </div>
        <div className="relative z-10 mx-auto mt-5 grid w-full max-w-xl grid-cols-3 divide-x divide-white/15 rounded-2xl border border-white/10 bg-black/55 py-3 backdrop-blur-md lg:mx-0 lg:mt-7">
          {trustPoints.map(({ icon: Icon, label }) => <div key={label} className="flex min-w-0 flex-col items-center gap-1.5 px-2 text-center sm:flex-row sm:justify-center sm:text-left"><Icon size={16} className="autox-neon-mark shrink-0" /><span className="text-[9px] font-bold leading-tight text-zinc-200 sm:text-[11px]">{label}</span></div>)}
        </div>
      </div>

      {items.length > 1 && <div className="absolute inset-x-0 bottom-0 z-20 mx-auto flex h-[72px] max-w-[1600px] items-center justify-center gap-5 px-4 sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-black/70 px-3 py-2 backdrop-blur-md">
          {items.map((item, i) => <button key={item.id} type="button" aria-label={`Go to slide ${i + 1}`} aria-current={i === currentIndex ? "true" : undefined} onClick={() => changeTo(i)} className={cn("relative h-2 overflow-hidden rounded-full transition-all duration-300", i === currentIndex ? "w-14 bg-white/15" : "w-5 bg-white/30 hover:bg-white/50")}>
            {i === currentIndex && <span key={`${currentIndex}-${paused}`} className={cn("absolute inset-y-0 left-0 rounded-full bg-autox-red", autoplay && !paused ? "animate-[heroProgress_linear_forwards]" : "w-full")} style={autoplay && !paused ? ({ animationDuration: `${Math.max(2500, interval)}ms` } as CSSProperties) : undefined} />}
          </button>)}
        </div>
        <div className="hidden items-center gap-2 sm:flex"><span className="mr-2 text-[10px] font-black uppercase tracking-[.18em] text-zinc-300">{String(currentIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span><button type="button" aria-label="Previous hero slide" onClick={() => changeTo((currentIndex - 1 + items.length) % items.length)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur transition hover:border-autox-red"><ArrowLeft size={17} /></button><button type="button" aria-label="Next hero slide" onClick={() => changeTo((currentIndex + 1) % items.length)} className="flex h-10 w-10 items-center justify-center rounded-full bg-autox-red text-white shadow-[0_8px_24px_rgba(237,28,36,.3)] transition hover:bg-red-600"><ArrowRight size={17} /></button></div>
      </div>}
    </section>
  );
}
