import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, ChevronRight, Headphones } from "lucide-react";

export function StandardPageHero({eyebrow,title,accent,description,icon:Icon,updated,showHelp=true}:{eyebrow:string;title:string;accent?:string;description:string;icon?:LucideIcon;updated?:string;showHelp?:boolean}){
  return <section className="relative overflow-hidden border-b border-white/[.06]">
    <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(237,28,36,.18),transparent_28rem),linear-gradient(180deg,#08080a_0%,#050506_100%)]" />
    <div aria-hidden className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
    <div className="relative mx-auto max-w-[1200px] px-4 py-12 lg:px-6 lg:py-16">
      <div className="mb-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.22em] text-zinc-500"><Link href="/" className="transition hover:text-white">Home</Link><ChevronRight size={12}/><span className="text-autox-red">{eyebrow}</span></div>
      <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
        <div className="max-w-3xl">{Icon&&<span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-autox-red/10 text-autox-red ring-1 ring-inset ring-autox-red/20"><Icon size={22}/></span>}<h1 className="text-4xl font-black leading-[.98] tracking-[-.045em] text-white sm:text-5xl lg:text-6xl">{title}{accent&&<><br/><span className="text-autox-red">{accent}</span></>}</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">{description}</p>{updated&&<p className="mt-4 text-[10px] font-bold uppercase tracking-[.16em] text-zinc-600">Last updated: {updated}</p>}</div>
        {showHelp&&<Link href="/contact" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-5 text-xs font-black uppercase tracking-wide text-white transition hover:border-autox-red/40 hover:bg-autox-red/[.08]"><Headphones size={15}/>Need help?<ArrowRight size={14}/></Link>}
      </div>
    </div>
  </section>;
}
