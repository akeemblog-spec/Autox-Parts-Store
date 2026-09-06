import type { Metadata } from "next";
import { BrandPageServer } from "@/components/pages/BrandPageServer";
import { getBrandBySlugDb } from "@/lib/db-queries/products";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandBySlugDb("piaggio-ape");
  return {
    title: brand ? `${brand.name} Genuine Parts` : "Brand Parts",
    description: `Shop genuine ${brand?.name ?? ""} parts online with islandwide delivery and warranty.`,
  };
}

export default function PiaggioApeBrandPage() {
  return <BrandPageServer slug="piaggio-ape" />;
}
