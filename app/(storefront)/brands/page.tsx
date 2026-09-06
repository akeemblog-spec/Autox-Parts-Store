import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionHeading } from "@/components/SectionHeading";
import { BrandCard } from "@/components/BrandCard";
import { getAllBrands } from "@/lib/db-queries/products";

export const metadata: Metadata = { title: "Shop By Brand", description: "Browse active motorcycle and three wheeler brands." };
export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await getAllBrands();
  const bikeBrands = brands.filter((b)=>b.vehicleType==="bike");
  const threeWheelerBrands = brands.filter((b)=>b.vehicleType==="three-wheeler");
  return <><main><div className="mx-auto max-w-[1600px] px-4 lg:px-6"><Breadcrumb items={[{label:"Home",href:"/"},{label:"Brands"}]}/></div><section className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6"><SectionHeading title="Shop By Bike" accent="Brand"/><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{bikeBrands.map((brand)=><BrandCard key={brand.id} brand={brand}/>)}</div></section><section className="mx-auto max-w-[1600px] px-4 pb-14 pt-6 lg:px-6"><SectionHeading title="Three Wheeler" accent="Brands"/><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{threeWheelerBrands.map((brand)=><BrandCard key={brand.id} brand={brand}/>)}</div></section></main></>;
}
