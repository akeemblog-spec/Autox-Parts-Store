import { Product } from "@/types";

export type SortOption = "popularity" | "price-asc" | "price-desc" | "rating" | "newest";

export interface ProductQuery {
  partType?: string[];
  category?: string[];
  brand?: string[];
  availability?: ("in-stock" | "out-of-stock")[];
  priceMin?: number;
  priceMax?: number;
  modelYear?: string;
  sort?: SortOption;
}

/**
 * Filters and sorts a product list against a query.
 *
 * This function currently operates on the local mock dataset, but its
 * signature intentionally mirrors what a real API/database query would look
 * like (a flat filter object in, a product array out). Swapping the body for
 * a fetch() call to a real backend endpoint later requires no changes to any
 * calling component.
 */
export function queryProducts(products: Product[], query: ProductQuery): Product[] {
  let result = [...products];

  if (query.partType && query.partType.length > 0) {
    result = result.filter((p) => query.partType!.includes(p.partType));
  }

  if (query.category && query.category.length > 0) {
    result = result.filter((p) => query.category!.includes(p.categorySlug));
  }

  if (query.brand && query.brand.length > 0) {
    result = result.filter((p) => query.brand!.includes(p.brandSlug));
  }

  if (query.availability && query.availability.length > 0) {
    result = result.filter((p) => {
      const status = p.inStock ? "in-stock" : "out-of-stock";
      return query.availability!.includes(status);
    });
  }

  if (typeof query.priceMin === "number") {
    result = result.filter((p) => p.price >= query.priceMin!);
  }

  if (typeof query.priceMax === "number") {
    result = result.filter((p) => p.price <= query.priceMax!);
  }

  if (query.modelYear && query.modelYear !== "all") {
    result = result.filter((p) => p.modelYears.includes(query.modelYear!));
  }

  switch (query.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      result.sort((a, b) => b.id.localeCompare(a.id));
      break;
    case "popularity":
    default:
      result.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
  }

  return result;
}
