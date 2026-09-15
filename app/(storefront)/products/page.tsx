import type { Metadata } from "next";
import { StandardPageHero } from "@/components/content/StandardPageHero";
import { PackageSearch } from "lucide-react";
import { LiveProductGrid } from "@/components/LiveProductGrid";
import { getAllCategories } from "@/lib/db-queries/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Parts",
  description: "Browse our full catalog of genuine and aftermarket motorcycle and three wheeler parts.",
};

export default async function AllProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; brand?: string; vehicleType?: string; model?: string; year?: string }> }) {
  const params = await searchParams;
  const categories = await getAllCategories();
  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.slug }));

  return (
    <>
      
      
      

      <main>
        <StandardPageHero eyebrow="All Parts" title="Every part." accent="One AutoX catalog." description="Browse genuine and aftermarket motorcycle and three-wheeler parts with filters built to get you to the right fit faster." icon={PackageSearch}/>

        <section className="mx-auto max-w-[1600px] px-4 lg:px-6 py-6">
          <LiveProductGrid showPartTypeFilter categoryOptions={categoryOptions} searchQuery={params.q} categorySlug={params.category} brandSlug={params.brand} vehicleType={params.vehicleType} model={params.model} year={params.year} />
        </section>
      </main>

      
    </>
  );
}
