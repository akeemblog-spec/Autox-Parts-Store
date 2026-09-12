"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, CalendarDays, Check, CreditCard, LockKeyhole, ShieldCheck, Sparkles, X, Zap } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export type InstallmentProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  image?: string | null;
  inStock?: boolean;
  genuine?: boolean;
};

export function InstallmentModal({
  product,
  open,
  onClose,
  onContinue,
}: {
  product: InstallmentProduct | null;
  open: boolean;
  onClose: () => void;
  onContinue?: (months: 3 | 6) => Promise<void> | void;
}) {
  const [months, setMonths] = useState<3 | 6>(3);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.documentElement.style.overflow = previous; window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  const monthly = useMemo(() => product ? Math.ceil(product.price / months) : 0, [product, months]);
  if (!open || !product) return null;

  const continueFlow = async () => {
    if (!onContinue || busy) return;
    setBusy(true);
    try { await onContinue(months); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[420] grid place-items-center overflow-y-auto bg-black/[.78] p-3 backdrop-blur-md sm:p-5" role="dialog" aria-modal="true" aria-labelledby="installment-title" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative my-auto w-full max-w-[700px] overflow-hidden rounded-[28px] bg-[#08090b] shadow-[0_30px_100px_rgba(0,0,0,.72),0_0_60px_rgba(237,28,36,.09)] ring-1 ring-inset ring-white/[.1]">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(237,28,36,.15),transparent_28rem),radial-gradient(circle_at_92%_88%,rgba(237,28,36,.09),transparent_22rem)]" />
        <div className="relative p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><div className="inline-flex items-center gap-2 rounded-full bg-autox-red/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.17em] text-autox-red ring-1 ring-inset ring-autox-red/20"><Sparkles size={12}/>Flexible payment</div><h2 id="installment-title" className="mt-3 text-xl font-black tracking-[-.025em] text-white sm:text-2xl">Choose your installment plan</h2><p className="mt-1 text-xs leading-5 text-zinc-500">See the estimated monthly split before continuing to checkout.</p></div>
            <button type="button" onClick={onClose} aria-label="Close installment options" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[.05] text-zinc-400 ring-1 ring-inset ring-white/[.08] transition hover:bg-autox-red hover:text-white"><X size={18}/></button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-[150px_1fr]">
            <div className="relative grid min-h-[150px] place-items-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_center,rgba(237,28,36,.2),transparent_58%),#050506] ring-1 ring-inset ring-autox-red/25">
              {product.image ? <img src={product.image} alt={product.name} className="h-[138px] w-[138px] object-contain drop-shadow-[0_14px_28px_rgba(237,28,36,.28)]"/> : <CreditCard size={42} className="text-autox-red"/>}
            </div>
            <div className="flex min-w-0 flex-col justify-center rounded-2xl bg-white/[.035] p-4 ring-1 ring-inset ring-white/[.07]">
              <div className="flex flex-wrap items-center gap-2">{product.genuine && <span className="rounded-full bg-autox-red px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white">Genuine</span>}<span className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{product.brand}</span></div>
              <h3 className="mt-2 line-clamp-2 text-lg font-extrabold text-white">{product.name}</h3>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-[.15em] text-zinc-600">Price</p><p className="mt-1 text-2xl font-black tracking-tight text-white">{formatPrice(product.price)}</p></div><span className={cn("text-[10px] font-bold", product.inStock === false ? "text-zinc-500" : "text-emerald-400")}>{product.inStock === false ? "Out of Stock" : "In Stock"}</span></div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#0d0f12] p-4 ring-1 ring-inset ring-white/[.08]">
            <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-autox-red/10 text-autox-red ring-1 ring-inset ring-autox-red/20"><CreditCard size={18}/></span><div><p className="text-sm font-extrabold text-white">Installment Option</p><p className="text-[10px] text-zinc-500">KOKO / Mintpay where enabled at checkout</p></div></div><span className="rounded-full bg-black/40 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-autox-red ring-1 ring-inset ring-autox-red/30">3 or 6 months</span></div>
          </div>

          <div className="mt-5"><p className="mb-3 text-[10px] font-black uppercase tracking-[.16em] text-zinc-500">Select duration</p><div className="grid grid-cols-2 gap-3">{([3,6] as const).map((plan)=><button key={plan} type="button" onClick={()=>setMonths(plan)} className={cn("relative min-h-[108px] rounded-2xl p-4 text-left transition-all duration-200", months===plan ? "bg-[linear-gradient(145deg,rgba(237,28,36,.16),rgba(237,28,36,.035))] shadow-[0_0_0_1px_#ed1c24,0_14px_35px_rgba(237,28,36,.13)]" : "bg-[#0b0d10] ring-1 ring-inset ring-white/[.1] hover:ring-autox-red/40")}><span className={cn("grid h-8 w-8 place-items-center rounded-xl",months===plan?"bg-autox-red text-white":"bg-white/[.04] text-autox-red")}><CalendarDays size={16}/></span><p className="mt-3 text-sm font-extrabold text-white">{plan} Months</p><p className="mt-1 text-[11px] text-zinc-400"><span className="font-extrabold text-white">{formatPrice(Math.ceil(product.price/plan))}</span> / month</p>{months===plan&&<span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-autox-red text-white"><Check size={12} strokeWidth={3}/></span>}</button>)}</div></div>

          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/[.08] ring-1 ring-inset ring-white/[.06]"><div className="flex items-center gap-3 bg-[#0a0b0d] p-3.5"><ShieldCheck size={18} className="shrink-0 text-zinc-300"/><div><p className="text-[10px] font-bold text-white">Secure checkout</p><p className="mt-0.5 text-[9px] text-zinc-600">Provider approval applies</p></div></div><div className="flex items-center gap-3 bg-[#0a0b0d] p-3.5"><Zap size={18} className="shrink-0 text-zinc-300"/><div><p className="text-[10px] font-bold text-white">Quick & easy</p><p className="mt-0.5 text-[9px] text-zinc-600">Choose provider at checkout</p></div></div></div>

          <div className="mt-5 rounded-2xl bg-black/28 p-3.5 text-center ring-1 ring-inset ring-white/[.05]"><p className="text-[10px] leading-5 text-zinc-500">Estimated plan: <b className="text-white">{months} × {formatPrice(monthly)}</b>. Final provider charges, eligibility and approval are confirmed during checkout.</p></div>

          {onContinue ? <button type="button" disabled={busy || product.inStock===false} onClick={continueFlow} className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#e30e18,#ff1630)] px-5 text-xs font-black uppercase tracking-wide text-white shadow-[0_15px_35px_rgba(237,28,36,.22)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"><LockKeyhole size={15}/>{busy ? "Preparing checkout…" : `Continue with ${months}-month plan`}<span aria-hidden>›</span></button> : null}
        </div>
      </div>
    </div>
  );
}
