import { Hero } from "@/components/Hero";
import { VehicleFinder } from "@/components/VehicleFinder";
import { SectionHeading } from "@/components/SectionHeading";
import { BrandCard } from "@/components/BrandCard";
import { CategoryCard } from "@/components/CategoryCard";
import { Carousel } from "@/components/Carousel";
import { HomeCampaignBanner } from "@/components/HomeCampaignBanner";
import { TrustCard } from "@/components/TrustCard";
import Link from "next/link";
import { ArrowUpRight, Truck } from "lucide-react";
import { getAllBrands, getAllCategories } from "@/lib/db-queries/products";
import { trustFeatures } from "@/lib/data/site";
import { getHeroSlides, getStorefrontSettings } from "@/lib/db-queries/storefront";
import { HomeLaunchExperience } from "@/components/HomeLaunchExperience";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [allBrands, categories, slides, settings] = await Promise.all([
    getAllBrands(), getAllCategories(), getHeroSlides(), getStorefrontSettings(),
  ]);
  const bikeBrands = allBrands.filter((b) => b.vehicleType === "bike");
  const threeWheelerBrands = allBrands.filter((b) => b.vehicleType === "three-wheeler");
  return <HomeLaunchExperience>
    <main>
      <Hero slides={slides} autoplay={settings.hero_autoplay !== "false"} interval={Number(settings.hero_interval || 5000)} pauseOnHover={settings.hero_pause_hover !== "false"} />
      <VehicleFinder />
      <section className="mx-auto max-w-[1600px] px-4 pb-12 lg:px-6"><SectionHeading title="Shop By Bike" accent="Brand" viewAllHref="/bikes" /><Carousel>{bikeBrands.map((brand) => <div key={brand.id} className="w-[190px] shrink-0 snap-start sm:w-[210px] xl:w-[220px]"><BrandCard brand={brand} settings={settings} active={brand.slug === "honda"} /></div>)}</Carousel></section>
      <section className="mx-auto max-w-[1600px] px-4 pb-12 lg:px-6"><SectionHeading title="Shop By" accent="Category" viewAllHref="/categories" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">{categories.map((cat) => <CategoryCard key={cat.id} category={cat} settings={settings} />)}</div></section>
      <section className="mx-auto max-w-[1600px] px-4 pb-12 lg:px-6" aria-label="Find parts for your bike"><HomeCampaignBanner campaign="finder" settings={settings} /></section>
      <section className="mx-auto max-w-[1600px] px-4 pb-12 lg:px-6"><SectionHeading title="Three Wheeler" accent="Brands" viewAllHref="/three-wheelers" /><Carousel>{threeWheelerBrands.map((brand) => <div key={brand.id} className="w-[190px] shrink-0 snap-start sm:w-[210px] xl:w-[220px]"><BrandCard brand={brand} settings={settings} /></div>)}<Link href="/three-wheelers" className="group relative hidden h-[326px] min-w-[260px] flex-1 snap-start flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#090909] p-6 transition-[border-color,box-shadow] hover:border-autox-red/70 hover:shadow-[0_0_20px_rgba(237,28,36,.12)] lg:flex" aria-label="Explore all three wheeler parts"><span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_15%,rgba(237,28,36,.24),transparent_55%),linear-gradient(135deg,transparent_55%,rgba(237,28,36,.08)_55%,transparent_57%)]" /><Truck size={126} strokeWidth={0.6} aria-hidden="true" className="absolute right-3 top-14 text-autox-red/25" /><span className="relative text-[10px] font-bold uppercase tracking-[.25em] text-autox-red">Built for every journey</span><span className="relative"><span className="block text-2xl font-black uppercase leading-tight tracking-tight text-white">Keep your three wheeler moving</span><span className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-autox-red">Explore all parts <ArrowUpRight size={16} aria-hidden="true" /></span></span></Link></Carousel></section>
      <section className="mx-auto max-w-[1600px] px-4 pb-12 lg:px-6" aria-label="Three wheeler parts"><HomeCampaignBanner campaign="threewheel" settings={settings} /></section>
      <section className="mx-auto grid max-w-[1600px] gap-4 px-4 pb-12 md:grid-cols-2 lg:px-6" aria-label="Featured promotions"><HomeCampaignBanner campaign="accessories" settings={settings} /><HomeCampaignBanner campaign="offers" settings={settings} /></section>
      <section className="mx-auto max-w-[1600px] px-4 pb-14 lg:px-6"><SectionHeading title="Why Choose" accent="AutoX Parts Store?" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{trustFeatures.map((feature) => <TrustCard key={feature.id} feature={feature} />)}</div></section>
    </main>
    
  </HomeLaunchExperience>;
}
