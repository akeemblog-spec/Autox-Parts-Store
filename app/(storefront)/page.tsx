import { Hero } from "@/components/Hero";
import { VehicleFinder } from "@/components/VehicleFinder";
import { SectionHeading } from "@/components/SectionHeading";
import { BrandCard } from "@/components/BrandCard";
import { CategoryCard } from "@/components/CategoryCard";
import { Carousel } from "@/components/Carousel";
import { PromoBanner } from "@/components/PromoBanner";
import { TrustCard } from "@/components/TrustCard";
import { getAllBrands, getAllCategories } from "@/lib/db-queries/products";
import { trustFeatures } from "@/lib/data/site";
import { getHeroSlides, getPromoBanners, getStorefrontSettings } from "@/lib/db-queries/storefront";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [allBrands, categories, slides, banners, settings] = await Promise.all([
    getAllBrands(), getAllCategories(), getHeroSlides(), getPromoBanners(), getStorefrontSettings(),
  ]);
  const bikeBrands = allBrands.filter((b) => b.vehicleType === "bike");
  const threeWheelerBrands = allBrands.filter((b) => b.vehicleType === "three-wheeler");
  const promoFallback = [
    { id: "installment", title: "EASY INSTALLMENT PLANS", description: "Own the parts you need today, pay in easy monthly installments.", image: "/images/promo/installment-wheel.svg", ctaLabel: "Learn More", ctaHref: "/offers", active: true, sortOrder: 0 },
    { id: "genuine", title: "GENUINE PARTS. TRUSTED QUALITY.", description: "Explore our wide range of 100% genuine parts with warranty.", image: "/images/promo/genuine-parts.svg", ctaLabel: "Shop Now", ctaHref: "/products", active: true, sortOrder: 1 },
  ];
  const promo = banners.length ? banners : promoFallback;

  return <>
    
    <main>
      <Hero slides={slides} autoplay={settings.hero_autoplay !== "false"} interval={Number(settings.hero_interval || 5000)} pauseOnHover={settings.hero_pause_hover !== "false"} />
      <VehicleFinder />
      <section className="mx-auto max-w-[1600px] px-4 pb-12 lg:px-6"><SectionHeading title="Shop By Bike" accent="Brand" viewAllHref="/bikes" /><Carousel>{bikeBrands.map((brand) => <div key={brand.id} className="w-[180px] shrink-0 snap-start sm:w-[200px]"><BrandCard brand={brand} active={brand.slug === "honda"} /></div>)}</Carousel></section>
      <section className="mx-auto max-w-[1600px] px-4 pb-12 lg:px-6"><SectionHeading title="Shop By" accent="Category" viewAllHref="/categories" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">{categories.map((cat) => <CategoryCard key={cat.id} category={cat} />)}</div></section>
      <section className="mx-auto max-w-[1600px] px-4 pb-12 lg:px-6"><SectionHeading title="Three Wheeler" accent="Brands" viewAllHref="/three-wheelers" /><Carousel>{threeWheelerBrands.map((brand) => <div key={brand.id} className="w-[180px] shrink-0 snap-start sm:w-[200px]"><BrandCard brand={brand} /></div>)}</Carousel></section>
      <section className="mx-auto grid max-w-[1600px] gap-4 px-4 pb-12 md:grid-cols-2 lg:px-6">{promo.map((banner, i) => <PromoBanner key={banner.id} banner={{ id: banner.id, title: banner.title, highlight: i === 0 ? "0% INTEREST PLANS" : "", description: banner.description ?? "", ctaLabel: banner.ctaLabel ?? "Learn More", ctaHref: banner.ctaHref ?? "/products", image: banner.image, variant: i === 0 ? "installment" : "genuine" }} />)}</section>
      <section className="mx-auto max-w-[1600px] px-4 pb-14 lg:px-6"><SectionHeading title="Why Choose" accent="AutoX Parts Store?" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{trustFeatures.map((feature) => <TrustCard key={feature.id} feature={feature} />)}</div></section>
    </main>
    
  </>;
}
