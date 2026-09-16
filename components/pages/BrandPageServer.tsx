import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowRight, BadgeCheck, Search, ShieldCheck, Truck, Wrench } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { LiveProductGrid } from "@/components/LiveProductGrid";
import { ModelSelector } from "@/components/ModelSelector";
import { db } from "@/db";
import { vehicleModels } from "@/db/schema";
import { getBrandBySlugDb, getAllCategories } from "@/lib/db-queries/products";
import { getStorefrontSettings } from "@/lib/db-queries/storefront";

const featureCards = [
  { icon: BadgeCheck, label: "Genuine Options" },
  { icon: Wrench, label: "Fitment Focused" },
  { icon: ShieldCheck, label: "Warranty Support" },
  { icon: Truck, label: "Islandwide Delivery" },
];

export async function BrandPageServer({ slug }: { slug: string }) {
  const brand = await getBrandBySlugDb(slug);
  if (!brand) notFound();

  const [categories, models, settings] = await Promise.all([
    getAllCategories(),
    db.select().from(vehicleModels).where(eq(vehicleModels.brandId, brand.id)),
    getStorefrontSettings(),
  ]);
  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.slug }));
  const featuredScenes = ["honda", "yamaha", "bajaj", "tvs", "suzuki", "hero", "ktm", "kawasaki", "royal-enfield", "bajaj-re", "tvs-king", "piaggio-ape", "mahindra-alfa", "atul-gem"];
  const defaultScene = featuredScenes.includes(slug) ? `/images/brand-heroes/${slug}.webp` : "";
  const catalogHero = brand.coverImage && !brand.coverImage.startsWith("/images/brands/") ? brand.coverImage : "";
  const heroImage = settings[`brand_hero_image_${slug}`] || catalogHero || defaultScene || brand.coverImage || brand.vehicleImage || "/images/fallback/brand-garage.webp";
  const logoSlug = ({ "bajaj-re": "bajaj", "tvs-king": "tvs", "piaggio-ape": "piaggio", "mahindra-alfa": "mahindra", "atul-gem": "atul" } as Record<string,string>)[slug] || slug;
  const catalogLogo = brand.logo && !brand.logo.startsWith("/images/brands/") ? brand.logo : "";
  const defaultLogo = featuredScenes.includes(slug) ? `/images/brand-cards/${logoSlug}-logo.webp` : brand.logo;
  const heroLogo = settings[`brand_card_logo_${slug}`] || (slug === "ktm" ? defaultLogo : catalogLogo || defaultLogo);

  return (
    <main className="bg-[#050506]">
      <div className="mx-auto max-w-[1600px] px-4 lg:px-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Brands", href: "/brands" }, { label: brand.name }]} />
      </div>

      <section className="relative overflow-hidden border-y border-white/[.08] bg-[radial-gradient(circle_at_75%_60%,rgba(237,28,36,.27),transparent_48%),#070708]">
        {heroImage ? <img src={heroImage} alt={`${brand.name} ${brand.vehicleType === "three-wheeler" ? "three-wheeler" : "motorcycle"} in a neon performance garage`} className="absolute inset-x-0 top-0 h-[390px] w-full object-cover object-[85%_center] sm:h-[470px] lg:inset-0 lg:h-full lg:object-center" /> : <Wrench size={76} className="absolute right-[20%] top-20 text-autox-red/40"/>}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,6,.03)_0%,rgba(5,5,6,.15)_290px,#070708_395px)] sm:bg-[linear-gradient(to_bottom,rgba(5,5,6,.03)_0%,rgba(5,5,6,.14)_380px,#070708_475px)] lg:bg-[linear-gradient(to_right,rgba(5,5,6,.9)_0%,rgba(5,5,6,.8)_35%,rgba(5,5,6,.45)_55%,rgba(5,5,6,.05)_81%)]"/>
        <div aria-hidden className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:linear-gradient(to_right,black,transparent_70%)]" />
        {heroLogo && <img src={heroLogo} alt="" aria-hidden="true" className="absolute right-8 top-10 hidden max-h-16 max-w-[200px] object-contain drop-shadow-[0_0_14px_rgba(237,28,36,.6)] lg:block"/>}
        <div className="relative mx-auto flex min-h-[620px] max-w-[1600px] flex-col px-4 pb-10 pt-[355px] sm:pt-[435px] lg:h-[550px] lg:min-h-[550px] lg:px-6 lg:pb-[30px] lg:pt-10">
          <div className="max-w-[620px] lg:max-w-[690px]">
            {heroLogo && <img src={heroLogo} alt={`${brand.name} logo`} className="mb-5 max-h-11 max-w-[190px] object-contain object-left drop-shadow-[0_2px_8px_rgba(0,0,0,.7)] lg:hidden"/>}
            <div className="flex flex-wrap items-center gap-3"><span className="rounded-full border border-autox-red bg-autox-red/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-autox-red shadow-[0_0_14px_rgba(237,28,36,.32)]">{brand.name} Parts</span><span className="text-[10px] font-bold uppercase tracking-[.16em] text-zinc-300">{brand.productCount} {brand.productCount === 1 ? "part" : "parts"} available</span></div>
            <h1 className="mt-5 text-4xl font-black leading-[.98] tracking-[-.045em] text-white sm:text-5xl lg:mt-4 lg:text-6xl">Keep your {brand.name}<br/><span className="text-autox-red">running at its best.</span></h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-300 lg:mt-3">{brand.description || `Browse compatible ${brand.name} parts, filter by category, and confirm fitment before you order.`}</p>
            <div className="mt-6 flex flex-wrap gap-3 lg:mt-4"><a href="#brand-parts" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-autox-red px-5 text-xs font-black uppercase tracking-wide text-white shadow-[0_12px_28px_rgba(237,28,36,.2)] transition hover:bg-red-600">Shop {brand.name}<ArrowRight size={14}/></a><Link href="/parts-finder" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/[.075] px-5 text-xs font-black uppercase tracking-wide text-white ring-1 ring-inset ring-white/[.2] transition hover:bg-white/[.12]"><Search size={14}/>Find my part</Link></div>
          </div>
          <div className="mt-8 grid max-w-[850px] grid-cols-2 gap-2 sm:grid-cols-4 lg:mt-5 lg:w-max lg:grid-cols-[repeat(4,140px)]">{featureCards.map(({icon:Icon,label})=><div key={label} className="autox-neon-frame group flex min-h-[40px] items-center gap-2 rounded-lg border bg-[#0c0c0e]/80 px-2.5 py-1.5 backdrop-blur-sm"><Icon size={15} className="autox-neon-mark shrink-0"/><span className="text-[10px] font-bold leading-4 text-zinc-100">{label}</span></div>)}</div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-8 text-[9px] font-bold uppercase tracking-[.15em] text-zinc-300 lg:pt-3 lg:text-[10px] lg:tracking-[.2em]"><span className="flex items-center gap-2 leading-none"><span className="h-0.5 w-6 bg-autox-red shadow-[0_0_10px_rgba(237,28,36,.55)] lg:w-8"/> Genuine parts. Greater journeys.</span><span className="inline-flex items-center gap-2 leading-none"><span className="leading-none">{brand.name}</span><span className="text-zinc-500">|</span><span className="inline-flex items-center text-sm font-black leading-none normal-case tracking-tight text-white">Auto<span className="text-autox-red">X</span></span></span></div>
        </div>
      </section>

      {models.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-4 py-9 lg:px-6">
          <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-autox-red">Choose your ride</p><h2 className="mt-1 text-xl font-extrabold text-white">Popular {brand.name} models</h2></div><p className="hidden max-w-sm text-right text-[11px] leading-5 text-zinc-500 sm:block">Select a model to browse visually. Product compatibility remains available in the filters below.</p></div>
          <ModelSelector models={models.map((m) => ({ ...m, yearTo: m.yearTo === "Present" ? "Present" : Number(m.yearTo) }))}/>
        </section>
      )}

      <section id="brand-parts" className="mx-auto max-w-[1600px] border-t border-white/[.06] px-4 py-9 lg:px-6">
        <div className="mb-6"><p className="text-[10px] font-black uppercase tracking-[.18em] text-autox-red">Genuine fit. Better choice.</p><h2 className="mt-1 text-2xl font-extrabold text-white">Shop {brand.name} parts</h2></div>
        <LiveProductGrid brandSlug={slug} showPartTypeFilter categoryOptions={categoryOptions} />
      </section>
    </main>
  );
}
