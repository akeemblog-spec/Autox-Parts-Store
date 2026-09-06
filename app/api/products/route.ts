import { NextRequest, NextResponse } from "next/server";
import { findProducts } from "@/lib/db-queries/products";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const brandSlug = params.get("brand") ?? undefined;
  const categorySlugs = params.getAll("category").filter(Boolean);
  const categorySlug = categorySlugs[0] ?? undefined;
  const vehicleType = params.get("vehicleType") ?? undefined;
  const partType = params.getAll("partType");
  const priceMin = params.get("priceMin") ? Number(params.get("priceMin")) : undefined;
  const priceMax = params.get("priceMax") ? Number(params.get("priceMax")) : undefined;
  const inStockOnly = params.get("inStockOnly") === "true";
  const sort = (params.get("sort") as "popularity" | "price-asc" | "price-desc" | "rating" | "newest") ?? "popularity";
  const limit = params.get("limit") ? Math.min(Math.max(Number(params.get("limit")), 1), 100) : undefined;
  const offset = params.get("offset") ? Math.max(Number(params.get("offset")), 0) : undefined;
  const query = params.get("q")?.trim() || undefined;
  const model = params.get("model")?.trim() || undefined;
  const yearParam = params.get("year");
  const year = yearParam && /^\d{4}$/.test(yearParam) ? Number(yearParam) : undefined;

  const items = await findProducts({
    brandSlug,
    categorySlug,
    categorySlugs: categorySlugs.length ? categorySlugs : undefined,
    vehicleType,
    partType: partType.length > 0 ? partType : undefined,
    priceMin,
    priceMax,
    inStockOnly,
    sort,
    limit: limit ? limit + 1 : undefined,
    offset,
    query,
    model,
    year,
  });

  const hasMore = Boolean(limit && items.length > limit);
  const visibleItems = hasMore && limit ? items.slice(0, limit) : items;
  return NextResponse.json({ products: visibleItems, count: visibleItems.length, hasMore });
}
