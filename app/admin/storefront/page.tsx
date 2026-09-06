import { asc } from "drizzle-orm";
import { db } from "@/db";
import { banners, heroSlides, siteSettings } from "@/db/schema";
import { StorefrontManager } from "@/components/admin/StorefrontManager";
export const dynamic = "force-dynamic";
export default async function StorefrontPage(){ const [slides,promo,settings]=await Promise.all([db.select().from(heroSlides).orderBy(asc(heroSlides.sortOrder)),db.select().from(banners).orderBy(asc(banners.sortOrder)),db.select().from(siteSettings)]); return <StorefrontManager initialSlides={slides} initialBanners={promo} initialSettings={Object.fromEntries(settings.map(s=>[s.key,s.value]))}/>; }
