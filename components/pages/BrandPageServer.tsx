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

const featureCards = [
  { icon: BadgeCheck, label: "Genuine Options" },
  { icon: Wrench, label: "Fitment Focused" },
  { icon: ShieldCheck, label: "Warranty Support" },
  { icon: Truck, label: "Islandwide Delivery" },
];

export async function BrandPageServer({ slug }: { slug: string }) {
  const brand = await getBrandBySlugDb(slug);
  if (!brand) notFound();

  const [categories, models] = await Promise.all([
    getAllCategories(),
    db.select().from(vehicleModels).where(eq(vehicleModels.brandId, brand.id)),
  ]);
  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.slug }));
  const heroImage = brand.coverImage || brand.vehicleImage;

  return (
    <main className="bg-[#050506]">
      <div className="mx-auto max-w-[1600px] px-4 lg:px-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Brands", href: "/brands" }, { label: brand.name }]} />
      </div>

      <section className="relative overflow-hidden border-y border-white/[.06] bg-black">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_72%_44%,rgba(237,28,36,.22),transparent_32rem),linear-gradient(100deg,#050506_0%,#08090b_56%,#060607_100%)]" />
        <div aria-hidden className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:linear-gradient(to_right,black,transparent_85%)]" />
        <div className="relative mx-auto grid min-h-[520px] max-w-[1600px] items-center gap-8 px-4 py-10 lg:grid-cols-[.9fr_1.1fr] lg:px-6 lg:py-12">
          <div className="z-10 order-2 max-w-xl lg:order-1">
            <div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-autox-red/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-autox-red ring-1 ring-inset ring-autox-red/20">{brand.name} Parts</span><span className="text-[10px] font-bold uppercase tracking-[.16em] text-zinc-600">{brand.productCount} {brand.productCount === 1 ? "part" : "parts"} available</span></div>
            <h1 className="mt-5 text-4xl font-black leading-[.98] tracking-[-.045em] text-white sm:text-5xl lg:text-6xl">Keep your {brand.name}<br/><span className="text-autox-red">running at its best.</span></h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400">{brand.description || `Browse compatible ${brand.name} parts, filter by category, and confirm fitment before you order.`}</p>
            <div className="mt-6 flex flex-wrap gap-3"><a href="#brand-parts" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-autox-red px-5 text-xs font-black uppercase tracking-wide text-white shadow-[0_12px_28px_rgba(237,28,36,.2)] transition hover:bg-red-600">Shop {brand.name}<ArrowRight size={14}/></a><Link href="/parts-finder" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/[.045] px-5 text-xs font-black uppercase tracking-wide text-white ring-1 ring-inset ring-white/[.1] transition hover:bg-white/[.08]"><Search size={14}/>Find my part</Link></div>
            <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">{featureCards.map(({icon:Icon,label})=><div key={label} className="rounded-xl bg-white/[.035] p-3 ring-1 ring-inset ring-white/[.06]"><Icon size={15} className="text-autox-red"/><span className="mt-2 block text-[9px] font-bold leading-4 text-zinc-300">{label}</span></div>)}</div>
          </div>

          <div className="order-1 flex h-[280px] items-center justify-center overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(237,28,36,.16),transparent_55%)] sm:h-[360px] lg:order-2 lg:h-[450px]">
            {heroImage ? <img src={heroImage} alt={`${brand.name} vehicle`} className="h-full w-full object-contain p-3 drop-shadow-[0_24px_60px_rgba(237,28,36,.28)] sm:p-6"/> : <Wrench size={76} className="text-autox-red/40"/>}
          </div>
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
