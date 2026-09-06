import { NextRequest, NextResponse } from "next/server";
import { findProductBySlug, findRelatedProducts } from "@/lib/db-queries/products";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await findProductBySlug(slug);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const related = await findRelatedProducts(product.categoryId, product.id);

  return NextResponse.json({ product, related });
}
