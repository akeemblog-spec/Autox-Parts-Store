import type { Metadata } from "next";
import { BrandPageServer } from "@/components/pages/BrandPageServer";
import { getBrandBySlugDb } from "@/lib/db-queries/products";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { const brand=await getBrandBySlugDb("honda"); return { title: brand ? `${brand.name} Genuine Parts` : "Honda Parts", description: "Shop Honda motorcycle parts with model compatibility, warranty information and islandwide delivery." }; }
export default function HondaBrandPage(){ return <BrandPageServer slug="honda"/>; }
