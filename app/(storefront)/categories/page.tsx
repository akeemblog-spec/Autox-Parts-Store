import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionHeading } from "@/components/SectionHeading";
import { CategoryCard } from "@/components/CategoryCard";
import { getAllCategories } from "@/lib/db-queries/products";

export const metadata: Metadata = { title: "Shop By Category", description: "Browse genuine motorcycle and three wheeler parts by category." };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getAllCategories();
  return <><main><div className="mx-auto max-w-[1600px] px-4 lg:px-6"><Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categories" }]} /></div><section className="mx-auto max-w-[1600px] px-4 py-6 pb-14 lg:px-6"><SectionHeading title="Shop By" accent="Category" /><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{categories.map((cat) => <CategoryCard key={cat.id} category={cat} />)}</div></section></main></>;
}
