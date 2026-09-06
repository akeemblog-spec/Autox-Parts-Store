import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
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
        <div className="mx-auto max-w-[1600px] px-4 lg:px-6">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "All Products" }]} />
        </div>

        <section className="mx-auto max-w-[1600px] px-4 lg:px-6 pb-4">
          <h1 className="text-2xl font-extrabold text-white">All Parts</h1>
          <p className="text-autox-gray text-sm mt-1">Browse our full catalog of genuine and aftermarket parts.</p>
        </section>

        <section className="mx-auto max-w-[1600px] px-4 lg:px-6 py-6">
          <LiveProductGrid showPartTypeFilter categoryOptions={categoryOptions} searchQuery={params.q} categorySlug={params.category} brandSlug={params.brand} vehicleType={params.vehicleType} model={params.model} year={params.year} />
        </section>
      </main>

      
    </>
  );
}
