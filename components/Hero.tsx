"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, ArrowRight, CreditCard, Scan, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { ButtonLink } from "./ui/Button";
import { cn } from "@/lib/utils/cn";

const trustPoints = [
  { icon: ShieldCheck, label: "Genuine Parts" },
  { icon: Truck, label: "Islandwide Delivery" },
  { icon: CreditCard, label: "Secure Checkout" },
];

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

const SWIPE_THRESHOLD = 54;

export function Hero({ slides, autoplay = true, interval = 5000, pauseOnHover = true }: { slides: Slide[]; autoplay?: boolean; interval?: number; pauseOnHover?: boolean }) {
  const safeSlides = useMemo(() => slides.length ? slides : [{ id: "fallback", eyebrow: "Genuine performance parts", headline: "Find the Right Part.", headlineAccent: "Ride With Confidence.", description: "Premium motorcycle and three-wheeler parts for riders who expect better fit, quality and reliability.", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200&auto=format&fit=crop", mobileImage: null, primaryLabel: "Shop Parts", primaryHref: "/products", secondaryLabel: "Find My Part", secondaryHref: "/parts-finder" }], [slides]);
  const [slide, setSlide] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [settling, setSettling] = useState<-1 | 1 | null>(null);
  const [snapping, setSnapping] = useState(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const horizontalDrag = useRef(false);
  const dragged = useRef(false);
  const transitionTimer = useRef<number | null>(null);

  const paused = (pauseOnHover && hovered) || interactionPaused;
  const activeIndex = slide % safeSlides.length;
  const prevIndex = (activeIndex - 1 + safeSlides.length) % safeSlides.length;
  const nextIndex = (activeIndex + 1) % safeSlides.length;
  const active = safeSlides[activeIndex];

  useEffect(() => {
    safeSlides.forEach((item) => {
      const desktop = new window.Image(); desktop.src = item.image;
      if (item.mobileImage) { const mobile = new window.Image(); mobile.src = item.mobileImage; }
    });
  }, [safeSlides]);

  const finishTransition = useCallback((direction: -1 | 1) => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    setSettling(direction);
    transitionTimer.current = window.setTimeout(() => {
      setSlide((current) => (current + direction + safeSlides.length) % safeSlides.length);
      setSettling(null);
      setDragX(0);
    }, 410);
  }, [safeSlides.length]);

  useEffect(() => () => { if (transitionTimer.current) window.clearTimeout(transitionTimer.current); }, []);

  useEffect(() => {
    if (!autoplay || paused || safeSlides.length < 2 || settling) return;
    const timer = window.setTimeout(() => finishTransition(1), Math.max(2500, interval));
    return () => window.clearTimeout(timer);
  }, [autoplay, interval, paused, safeSlides.length, activeIndex, settling, finishTransition]);

  const go = (direction: -1 | 1) => {
    if (safeSlides.length < 2 || settling) return;
    setInteractionPaused(true);
    finishTransition(direction);
    window.setTimeout(() => setInteractionPaused(false), 650);
  };

  const jumpTo = (index: number) => {
    if (index === activeIndex || settling) return;
    setSlide(index);
    setDragX(0);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (safeSlides.length < 2 || settling) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
    horizontalDrag.current = false;
    dragged.current = false;
    setInteractionPaused(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    if (!start || settling) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!horizontalDrag.current && Math.abs(dx) > 8) horizontalDrag.current = Math.abs(dx) > Math.abs(dy);
    if (!horizontalDrag.current) return;
    if (Math.abs(dx) > 12) dragged.current = true;
    setDragX(Math.max(-220, Math.min(220, dx)));
  };

  const endPointer = () => {
    if (!pointerStart.current) return;
    pointerStart.current = null;
    if (horizontalDrag.current && Math.abs(dragX) >= SWIPE_THRESHOLD) finishTransition(dragX < 0 ? 1 : -1);
    else { setSnapping(true); setDragX(0); window.setTimeout(() => setSnapping(false), 260); }
    horizontalDrag.current = false;
    window.setTimeout(() => setInteractionPaused(false), 550);
  };

  const trackTransform = settling === 1 ? "translate3d(-200%,0,0)" : settling === -1 ? "translate3d(0%,0,0)" : `translate3d(calc(-100% + ${dragX}px),0,0)`;

  const renderPanel = (item: Slide, interactive: boolean) => {
    const image = item.image;
    return <div className="grid h-full w-full shrink-0 grid-cols-1 items-center gap-3 px-4 pb-2 pt-5 sm:px-6 lg:grid-cols-[minmax(0,.9fr)_minmax(480px,1.1fr)] lg:gap-10 lg:px-8 lg:pt-8 xl:px-10">
      <div className={cn("z-20 order-1 mx-auto max-w-2xl text-center lg:mx-0 lg:text-left", !interactive && "pointer-events-none select-none")}>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-autox-red/[.09] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.2em] text-autox-red ring-1 ring-inset ring-autox-red/20 sm:text-xs"><Sparkles size={13}/>{item.eyebrow || "Genuine performance parts"}</div>
        <h1 className="text-[2.2rem] font-black leading-[.98] tracking-[-.045em] text-white sm:text-5xl lg:text-[3.75rem] xl:text-[4.45rem]">{item.headline}{item.headlineAccent && <><br/><span className="text-autox-red">{item.headlineAccent}</span></>}</h1>
        {item.description && <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base sm:leading-7 lg:mx-0 lg:max-w-lg">{item.description}</p>}
        <div className="mt-5 flex flex-col justify-center gap-2.5 sm:flex-row lg:justify-start">
          {interactive ? <><ButtonLink href={item.primaryHref} size="md" className="min-h-12 justify-center rounded-xl px-6 shadow-[0_12px_30px_rgba(237,28,36,.18)]">{item.primaryLabel}<ArrowRight size={16}/></ButtonLink>{item.secondaryLabel && item.secondaryHref && <ButtonLink href={item.secondaryHref} variant="outline" size="md" className="min-h-12 justify-center rounded-xl border-white/12 bg-white/[.035] px-6 backdrop-blur"><Scan size={16}/>{item.secondaryLabel}</ButtonLink>}</> : <><span className="min-h-12 rounded-xl bg-autox-red px-6 py-3 text-xs font-black uppercase text-white opacity-80">{item.primaryLabel}</span>{item.secondaryLabel && <span className="min-h-12 rounded-xl bg-white/[.035] px-6 py-3 text-xs font-black uppercase text-white opacity-60 ring-1 ring-inset ring-white/[.08]">{item.secondaryLabel}</span>}</>}
        </div>
        <div className="mx-auto mt-6 grid max-w-xl grid-cols-3 divide-x divide-white/[.08] rounded-2xl bg-white/[.035] py-3 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur-sm lg:mx-0">{trustPoints.map(({icon:Icon,label})=><div key={label} className="flex min-w-0 flex-col items-center gap-1.5 px-2 text-center sm:flex-row sm:justify-center sm:text-left"><Icon size={16} className="shrink-0 text-autox-red"/><span className="text-[9px] font-bold leading-tight text-zinc-300 sm:text-[11px]">{label}</span></div>)}</div>
      </div>

      <div className="relative order-2 mx-auto flex h-[225px] w-full max-w-[820px] items-center justify-center overflow-hidden rounded-[28px] sm:h-[270px] lg:h-[500px]">
        <picture className="absolute inset-0 opacity-20 blur-2xl saturate-125">
          {item.mobileImage && <source media="(max-width: 767px)" srcSet={item.mobileImage}/>}<img src={image} alt="" aria-hidden className="h-full w-full scale-110 object-cover"/>
        </picture>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,6,.74),rgba(5,5,6,.12)_42%,rgba(5,5,6,.25)),radial-gradient(circle_at_58%_50%,rgba(237,28,36,.17),transparent_44%)]"/>
        <div aria-hidden className="absolute bottom-[13%] left-1/2 h-[18px] w-[55%] -translate-x-1/2 rounded-full bg-black/85 blur-xl"/>
        <span aria-hidden className="absolute right-[2%] top-[2%] select-none text-[7rem] font-black leading-none text-white/[.025] sm:text-[9rem] lg:text-[14rem]" style={{WebkitTextStroke:"1px rgba(237,28,36,.12)"}}>X</span>
        <picture className="relative z-10 flex h-full w-full items-center justify-center p-3 sm:p-5 lg:p-7">
          {item.mobileImage && <source media="(max-width: 767px)" srcSet={item.mobileImage}/>}<img src={image} alt={item.headline} draggable={false} className="max-h-full max-w-full object-contain drop-shadow-[0_28px_70px_rgba(237,28,36,.25)] transition-transform duration-700 ease-out"/>
        </picture>
      </div>
    </div>;
  };

  return (
    <section className="relative isolate h-[700px] overflow-hidden bg-[#050506] sm:h-[735px] lg:h-[680px] xl:h-[710px]" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_74%_46%,rgba(237,28,36,.2),transparent_31%),radial-gradient(circle_at_13%_25%,rgba(255,255,255,.04),transparent_26%),linear-gradient(180deg,#050506_0%,#08080a_100%)]"/>
      <div aria-hidden className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] [background-size:46px_46px] [mask-image:linear-gradient(to_right,black,transparent_86%)]"/>

      <div className="relative mx-auto h-full max-w-[1600px]">
        <div className="h-[calc(100%-72px)] overflow-hidden touch-pan-y" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endPointer} onPointerCancel={endPointer} onClickCapture={(event)=>{if(dragged.current){event.preventDefault();event.stopPropagation();dragged.current=false;}}}>
          <div className="flex h-full w-full will-change-transform" style={{ transform: trackTransform, transition: settling ? "transform .41s cubic-bezier(.22,1,.36,1)" : snapping ? "transform .26s cubic-bezier(.22,1,.36,1)" : "none" }}>
            {renderPanel(safeSlides[prevIndex], false)}
            {renderPanel(active, true)}
            {renderPanel(safeSlides[nextIndex], false)}
          </div>
        </div>

        {safeSlides.length > 1 && <div className="absolute inset-x-0 bottom-0 z-30 flex h-[72px] items-center justify-center gap-5 px-4 sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 rounded-full bg-black/45 px-3 py-2 backdrop-blur-md ring-1 ring-inset ring-white/[.07]">{safeSlides.map((s,i)=><button key={s.id} type="button" aria-label={`Go to slide ${i+1}`} aria-current={i===activeIndex?"true":undefined} onClick={()=>jumpTo(i)} className={cn("relative h-2 overflow-hidden rounded-full transition-all duration-300",i===activeIndex?"w-14 bg-white/15":"w-5 bg-white/30 hover:bg-white/50")}>{i===activeIndex&&<span key={`${activeIndex}-${paused}-${settling}`} className={cn("absolute inset-y-0 left-0 rounded-full bg-autox-red shadow-[0_0_12px_rgba(237,28,36,.55)]",autoplay&&!paused&&!settling?"animate-[heroProgress_linear_forwards]":"w-full")} style={autoplay&&!paused&&!settling?({animationDuration:`${Math.max(2500,interval)}ms`} as CSSProperties):undefined}/>}</button>)}</div>
          <div className="hidden items-center gap-2 sm:flex"><span className="mr-2 text-[10px] font-black uppercase tracking-[.18em] text-zinc-600">{String(activeIndex+1).padStart(2,"0")} / {String(safeSlides.length).padStart(2,"0")}</span><button type="button" aria-label="Previous hero slide" onClick={()=>go(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[.055] text-zinc-300 ring-1 ring-inset ring-white/[.08] backdrop-blur transition hover:bg-white/[.1] hover:text-white"><ArrowLeft size={17}/></button><button type="button" aria-label="Next hero slide" onClick={()=>go(1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-autox-red text-white shadow-[0_8px_24px_rgba(237,28,36,.22)] transition hover:bg-red-600"><ArrowRight size={17}/></button></div>
        </div>}
      </div>
    </section>
  );
}
