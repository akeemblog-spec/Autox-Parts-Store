import type { Metadata } from "next";
import { BadgeCheck, Bike, Search, Wrench } from "lucide-react";
import { BrandCard } from "@/components/BrandCard";
import { getAllBrands } from "@/lib/db-queries/products";

export const metadata: Metadata = { title: "Shop By Brand", description: "Browse active motorcycle and three-wheeler brands and shop compatible AutoX parts." };
export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await getAllBrands();
  const bikeBrands = brands.filter((b)=>b.vehicleType==="bike");
  const threeWheelerBrands = brands.filter((b)=>b.vehicleType==="three-wheeler");
  return <main className="bg-[#050506]">
    <section className="relative overflow-hidden border-b border-white/[.06]"><div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_76%_40%,rgba(237,28,36,.18),transparent_30rem),linear-gradient(180deg,#08080a,#050506)]"/><div className="relative mx-auto max-w-[1600px] px-4 py-14 lg:px-6 lg:py-20"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-autox-red"><BadgeCheck size={13}/>Trusted fitment</div><div className="mt-4 grid items-end gap-6 lg:grid-cols-[1fr_auto]"><div><h1 className="text-4xl font-black tracking-[-.045em] text-white sm:text-5xl">Shop by <span className="text-autox-red">brand.</span></h1><p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">Start with the vehicle you know. Every brand page now uses the same AutoX layout, model selector and live product filters for a consistent shopping flow.</p></div><a href="/parts-finder" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/[.045] px-5 text-xs font-black uppercase tracking-wide text-white ring-1 ring-inset ring-white/[.1] hover:bg-white/[.08]"><Search size={14}/>Not sure? Find my part</a></div></div></section>
    <section className="mx-auto max-w-[1600px] px-4 py-10 lg:px-6"><div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-autox-red/10 text-autox-red"><Bike size={18}/></span><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-autox-red">Motorcycles</p><h2 className="text-xl font-extrabold text-white">Bike brands</h2></div></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{bikeBrands.map((brand)=><BrandCard key={brand.id} brand={brand}/>)}</div></section>
    <section className="mx-auto max-w-[1600px] px-4 pb-14 pt-3 lg:px-6"><div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-autox-red/10 text-autox-red"><Wrench size={18}/></span><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-autox-red">Commercial & utility</p><h2 className="text-xl font-extrabold text-white">Three-wheeler brands</h2></div></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{threeWheelerBrands.map((brand)=><BrandCard key={brand.id} brand={brand}/>)}</div></section>
  </main>;
}
