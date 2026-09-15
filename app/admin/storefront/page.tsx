import { asc } from "drizzle-orm";
import { db } from "@/db";
import { banners, heroSlides, siteSettings, brands, categories } from "@/db/schema";
import { StorefrontManager } from "@/components/admin/StorefrontManager";
export const dynamic = "force-dynamic";
export default async function StorefrontPage(){ const [slides,promo,settings,brandRows,categoryRows]=await Promise.all([db.select().from(heroSlides).orderBy(asc(heroSlides.sortOrder)),db.select().from(banners).orderBy(asc(banners.sortOrder)),db.select().from(siteSettings),db.select().from(brands).orderBy(asc(brands.name)),db.select().from(categories).orderBy(asc(categories.name))]); return <StorefrontManager initialSlides={slides} initialBanners={promo} initialSettings={Object.fromEntries(settings.map(s=>[s.key,s.value]))} initialBrands={brandRows.map(b=>({name:b.name,slug:b.slug,vehicleType:b.vehicleType}))} initialCategories={categoryRows.map(c=>({name:c.name,slug:c.slug}))}/>; }
