import Link from "next/link";
import { ArrowRight, BadgeCheck, Bike, Crosshair, Gauge, PackageCheck, Search, Settings2, ShieldCheck, Truck, Wrench } from "lucide-react";
import { getHomeCampaign, HomeCampaign } from "@/lib/home-campaigns";

type Props = { campaign: HomeCampaign; settings: Record<string, string> };

const finderFeatures = [
  { icon: ShieldCheck, label: "Vehicle specific fitment" },
  { icon: Gauge, label: "Faster search results" },
  { icon: Settings2, label: "OEM & aftermarket" },
];
const threeFeatures = [
  { icon: ShieldCheck, label: "Better Mileage" },
  { icon: Wrench, label: "Longer Life" },
  { icon: BadgeCheck, label: "Trusted Quality" },
  { icon: Truck, label: "Islandwide Delivery" },
];
const promoFeatures = {
  accessories: ["Premium quality", "Rider approved", "Fast delivery"],
  offers: ["Genuine parts", "Top brands", "Fast & secure shipping"],
};

export function HomeCampaignBanner({ campaign, settings }: Props) {
  const content = getHomeCampaign(campaign, settings);
  const isWide = campaign === "finder" || campaign === "threewheel";
  const isFinder = campaign === "finder";

  return <article className={`group relative isolate overflow-hidden rounded-[22px] border border-white/20 bg-[#080809] shadow-[0_18px_45px_rgba(0,0,0,.32)] transition-[border-color,box-shadow] duration-300 hover:border-autox-red/60 hover:shadow-[0_18px_55px_rgba(237,28,36,.12)] ${isFinder ? "min-h-[490px] sm:min-h-[420px] lg:min-h-[430px]" : campaign === "threewheel" ? "min-h-[490px] sm:min-h-[510px] lg:min-h-[580px]" : "min-h-[360px] sm:min-h-[390px]"}`}>
    <img src={content.image} alt="" aria-hidden="true" loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full object-cover ${isFinder ? "object-[70%_center] lg:object-center" : campaign === "threewheel" ? "object-[82%_top] lg:object-center" : campaign === "offers" ? "object-[78%_center] sm:object-center" : "object-[62%_center] sm:object-center"}`} />
    <div aria-hidden="true" className={`absolute inset-0 ${isWide ? "bg-[linear-gradient(0deg,#070708_0%,rgba(7,7,8,.8)_40%,rgba(7,7,8,.08)_100%)] lg:bg-[linear-gradient(90deg,rgba(5,5,6,.97)_0%,rgba(5,5,6,.88)_28%,rgba(5,5,6,.34)_55%,transparent_85%)]" : "bg-[linear-gradient(90deg,rgba(5,5,6,.98)_0%,rgba(5,5,6,.86)_44%,rgba(5,5,6,.26)_82%,rgba(5,5,6,.08)_100%)]"}`} />

    {isFinder && <div className="absolute right-6 top-6 z-10 hidden max-w-[56%] flex-wrap justify-end gap-2 lg:flex" aria-label="Parts finder steps">
      {[{ icon: Bike, label: "Select Brand" }, { icon: Settings2, label: "Choose Model" }, { icon: Crosshair, label: "Find Exact Parts" }].map(({ icon: Icon, label }, index) =>
        <Link key={label} href="/parts-finder" className="flex min-h-11 items-center gap-2 rounded-xl border border-autox-red/50 bg-black/80 px-3 text-[11px] font-bold text-white backdrop-blur-sm transition hover:border-autox-red hover:bg-black/95"><Icon size={16} className="text-autox-red" /><span className="text-autox-red">0{index + 1}</span>{label}</Link>
      )}
    </div>}

    <div className={`relative z-10 flex h-full min-h-[inherit] flex-col ${isWide ? "px-5 pb-5 pt-[195px] sm:px-9 sm:pt-[110px] lg:px-12 lg:pb-6 lg:pt-12" : "px-5 pb-5 pt-9 sm:px-8 sm:pt-10"}`}>
      <div className={isWide ? "max-w-[600px]" : "max-w-[390px]"}>
        <div className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.24em] text-zinc-300"><span className="h-[2px] w-8 shrink-0 bg-autox-red shadow-[0_0_12px_rgba(237,28,36,.7)]"/>{content.eyebrow}</div>
        <h2 className={`font-black uppercase italic leading-[.99] tracking-[-.035em] text-white ${isWide ? "text-[clamp(2rem,4.3vw,4.4rem)]" : "text-[clamp(2rem,3vw,3.45rem)]"}`}>{campaign === "threewheel" ? <><span className="block">{content.title} <span className="text-autox-red">{content.accent}</span></span><span className="block">{content.secondLine}</span></> : <><span className="block">{content.title}</span><span className="block text-autox-red">{content.accent}</span></>}</h2>
        <p className={`mt-4 max-w-[420px] leading-snug text-zinc-200 ${isWide ? "text-sm sm:text-lg" : "text-sm sm:text-base"}`}>{content.description}</p>
        <Link href={content.href} className="mt-6 inline-flex min-h-12 items-center justify-center gap-4 rounded-lg border border-red-300/30 bg-autox-red px-6 text-xs font-black uppercase tracking-wide text-white shadow-[0_0_24px_rgba(237,28,36,.35)] transition hover:bg-red-600 hover:shadow-[0_0_28px_rgba(237,28,36,.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-sm">{content.button}<ArrowRight size={17} aria-hidden="true" /></Link>
      </div>

      {isWide ? <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-[10px] font-bold uppercase tracking-wide text-zinc-300 sm:gap-x-6 sm:text-[11px]">
        {(isFinder ? finderFeatures : threeFeatures).map(({ icon: Icon, label }) => <span key={label} className="inline-flex items-center gap-2"><Icon size={19} className="text-autox-red" aria-hidden="true" />{label}</span>)}
      </div> : <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 pt-4 text-[10px] font-bold uppercase text-zinc-300">{promoFeatures[campaign].map(label => <span key={label} className="inline-flex items-center gap-1.5"><PackageCheck size={14} className="text-autox-red" aria-hidden="true" />{label}</span>)}</div>}
      {isFinder && <Search size={24} className="pointer-events-none absolute bottom-5 right-6 hidden text-autox-red/70 lg:block" aria-hidden="true" />}
    </div>
  </article>;
}
