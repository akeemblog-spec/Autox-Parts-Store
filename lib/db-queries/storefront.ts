import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { banners, heroSlides, siteSettings } from "@/db/schema";

export async function getStorefrontSettings() {
  const rows = await db.select().from(siteSettings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getHeroSlides() {
  return db.select().from(heroSlides).where(eq(heroSlides.active, true)).orderBy(asc(heroSlides.sortOrder), asc(heroSlides.createdAt));
}

export async function getPromoBanners() {
  return db.select().from(banners).where(eq(banners.active, true)).orderBy(asc(banners.sortOrder));
}
