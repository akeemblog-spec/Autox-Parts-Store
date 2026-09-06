import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionHeading } from "@/components/SectionHeading";
import { BrandCard } from "@/components/BrandCard";
import { LiveProductGrid } from "@/components/LiveProductGrid";
import { getAllBrands, getAllCategories } from "@/lib/db-queries/products";

export const metadata: Metadata = { title: "Bike Parts & Brands", description: "Shop motorcycle parts by bike brand." };
export const dynamic = "force-dynamic";

export default async function BikesPage() {
  const [allBrands, categories] = await Promise.all([getAllBrands(), getAllCategories()]);
  const bikeBrands = allBrands.filter((b) => b.vehicleType === "bike");
  return <><main><div className="mx-auto max-w-[1600px] px-4 lg:px-6"><Breadcrumb items={[{label:"Home",href:"/"},{label:"Bikes"}]}/></div><section className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6"><SectionHeading title="Bike" accent="Brands"/><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{bikeBrands.map((brand)=><BrandCard key={brand.id} brand={brand}/>)}</div></section><section className="mx-auto max-w-[1600px] px-4 pb-14 lg:px-6"><SectionHeading title="Bike" accent="Parts"/><LiveProductGrid vehicleType="bike" categoryOptions={categories.map(c=>({label:c.name,value:c.slug}))}/></section></main></>;
}
