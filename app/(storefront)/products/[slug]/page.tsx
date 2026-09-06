import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findProductBySlug, findRelatedProducts } from "@/lib/db-queries/products";
import { ProductDetailView } from "@/components/pages/ProductDetailView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await findProductBySlug(slug);
  return {
    title: product ? product.name : "Product",
    description: product ? product.description : "View product details.",
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await findProductBySlug(slug);
  if (!product) notFound();

  const related = await findRelatedProducts(product.categoryId, product.id);

  return <ProductDetailView product={product} related={related} />;
}
