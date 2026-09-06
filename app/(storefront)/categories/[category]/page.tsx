import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { LiveProductGrid } from "@/components/LiveProductGrid";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getCategory(slug: string) {
  const [category] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return category;
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategory(categorySlug);
  return {
    title: category ? category.name : "Category",
    description: category
      ? `Shop genuine ${category.name.toLowerCase()} for motorcycles and three wheelers. Islandwide delivery and warranty.`
      : "Browse parts by category.",
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const category = await getCategory(categorySlug);
  if (!category) notFound();

  return (
    <>
      
      
      

      <main>
        <div className="mx-auto max-w-[1600px] px-4 lg:px-6">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categories", href: "/categories" }, { label: category.name }]} />
        </div>

        <section className="mx-auto max-w-[1600px] px-4 lg:px-6 pb-4">
          <h1 className="text-2xl font-extrabold text-white">{category.name}</h1>
        </section>

        <section className="mx-auto max-w-[1600px] px-4 lg:px-6 py-6 pb-14">
          <LiveProductGrid categorySlug={category.slug} showPartTypeFilter />
        </section>
      </main>

      
    </>
  );
}
