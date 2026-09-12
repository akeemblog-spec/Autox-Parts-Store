import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, CreditCard, ShieldCheck, Sparkles, Zap } from "lucide-react";

export const metadata: Metadata = { title: "Installment Plans", description: "Learn how AutoX 3-month and 6-month installment options work on eligible motorcycle and three-wheeler parts." };

const plans = [
  { months: 3, title: "3 Months", note: "Higher monthly payment, faster payoff" },
  { months: 6, title: "6 Months", note: "Lower monthly payment, more flexibility" },
];

export default function InstallmentsPage(){
  return <main className="bg-[#050506]">
    <section className="relative overflow-hidden border-b border-white/[.06]">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(237,28,36,.22),transparent_30rem),linear-gradient(180deg,#08080a,#050506)]"/>
      <div className="relative mx-auto grid max-w-[1200px] gap-8 px-4 py-16 lg:grid-cols-[1fr_.85fr] lg:items-center lg:px-6 lg:py-20">
        <div><span className="inline-flex items-center gap-2 rounded-full bg-autox-red/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-autox-red ring-1 ring-inset ring-autox-red/20"><Sparkles size={12}/>Flexible payment</span><h1 className="mt-5 text-4xl font-black leading-[.98] tracking-[-.045em] text-white sm:text-5xl lg:text-6xl">Get the parts now.<br/><span className="text-autox-red">Pay your way.</span></h1><p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">Eligible AutoX products can show estimated 3-month and 6-month payment splits. Choose the plan in the product modal, then complete provider selection and approval during checkout.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/products" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-autox-red px-5 text-xs font-black uppercase tracking-wide text-white hover:bg-red-600">Browse eligible parts<ArrowRight size={14}/></Link><Link href="/faq" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/[.045] px-5 text-xs font-black uppercase tracking-wide text-white ring-1 ring-inset ring-white/[.1] hover:bg-white/[.08]">Installment FAQ</Link></div></div>
        <div className="rounded-[28px] bg-[#090a0c] p-5 shadow-[0_30px_80px_rgba(0,0,0,.45)] ring-1 ring-inset ring-white/[.08]"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-autox-red/10 text-autox-red ring-1 ring-inset ring-autox-red/20"><CreditCard size={20}/></span><div><p className="text-sm font-extrabold text-white">Simple plan preview</p><p className="text-[10px] text-zinc-500">Example based on an LKR 30,000 purchase</p></div></div><div className="mt-5 grid grid-cols-2 gap-3">{plans.map(plan=><div key={plan.months} className="rounded-2xl bg-[linear-gradient(145deg,rgba(237,28,36,.12),rgba(255,255,255,.02))] p-4 ring-1 ring-inset ring-white/[.08]"><CalendarDays size={18} className="text-autox-red"/><p className="mt-3 text-sm font-extrabold text-white">{plan.title}</p><p className="mt-1 text-xl font-black text-white">LKR {Math.ceil(30000/plan.months).toLocaleString()}<span className="ml-1 text-[10px] font-medium text-zinc-500">/ month</span></p><p className="mt-2 text-[9px] leading-4 text-zinc-600">{plan.note}</p></div>)}</div><p className="mt-4 text-[10px] leading-5 text-zinc-500">The product modal uses the actual product price. Final terms, fees, eligibility and approval are controlled by the selected installment provider.</p></div>
      </div>
    </section>
    <section className="mx-auto max-w-[1200px] px-4 py-12 lg:px-6"><div className="grid gap-4 md:grid-cols-3">{[
      {icon:CreditCard,title:"1. Open Installments",text:"On any eligible product, tap Installments to see the current product price and available plan estimates."},
      {icon:CalendarDays,title:"2. Choose 3 or 6 months",text:"Compare the monthly split and choose the duration that best fits your budget."},
      {icon:ShieldCheck,title:"3. Complete checkout",text:"Add the item to cart and choose an enabled installment provider. Provider approval and final terms apply."},
    ].map(({icon:Icon,title,text})=><article key={title} className="rounded-2xl bg-[#0b0b0d] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]"><Icon size={20} className="text-autox-red"/><h2 className="mt-4 text-sm font-extrabold text-white">{title}</h2><p className="mt-2 text-xs leading-6 text-zinc-500">{text}</p></article>)}</div><div className="mt-6 rounded-2xl bg-autox-red/[.06] p-5 ring-1 ring-inset ring-autox-red/15"><div className="flex gap-3"><Zap size={18} className="mt-0.5 shrink-0 text-autox-red"/><p className="text-xs leading-6 text-zinc-400"><b className="text-white">Important:</b> AutoX plan figures are estimates only. A displayed monthly split does not guarantee approval or 0% interest. The payment provider shown at checkout supplies the final eligibility, fees and terms.</p></div></div></section>
  </main>
}
