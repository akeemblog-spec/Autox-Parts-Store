import type { Metadata } from "next";
import { StandardPageHero } from "@/components/content/StandardPageHero";
import { Truck } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { BrandCard } from "@/components/BrandCard";
import { LiveProductGrid } from "@/components/LiveProductGrid";
import { getAllBrands, getAllCategories } from "@/lib/db-queries/products";

export const metadata: Metadata = { title: "Three Wheeler Parts", description: "Shop genuine three wheeler parts by brand." };
export const dynamic = "force-dynamic";

export default async function ThreeWheelersPage(){const [brands,categories]=await Promise.all([getAllBrands(),getAllCategories()]);const rows=brands.filter(b=>b.vehicleType==="three-wheeler");return <><main><StandardPageHero eyebrow="Three Wheelers" title="Keep working." accent="Keep moving." description="Shop three-wheeler parts by brand and compatibility with islandwide delivery options." icon={Truck}/><section className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6"><SectionHeading title="Three Wheeler" accent="Brands"/><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{rows.map(brand=><BrandCard key={brand.id} brand={brand}/>)}</div></section><section className="mx-auto max-w-[1600px] px-4 pb-14 lg:px-6"><SectionHeading title="Three Wheeler" accent="Parts"/><LiveProductGrid vehicleType="three-wheeler" categoryOptions={categories.map(c=>({label:c.name,value:c.slug}))}/></section></main></>}
