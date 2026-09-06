import { db } from "@/db";
import { products, brands, categories, productImages, productCompatibility, productSpecifications } from "@/db/schema";
import { eq, and, gte, lte, desc, asc, inArray, sql, or, ilike } from "drizzle-orm";

export interface ProductFilters {
  brandSlug?: string;
  categorySlug?: string;
  categorySlugs?: string[];
  vehicleType?: string;
  partType?: string[];
  priceMin?: number;
  priceMax?: number;
  inStockOnly?: boolean;
  sort?: "popularity" | "price-asc" | "price-desc" | "rating" | "newest";
  limit?: number;
  offset?: number;
  query?: string;
  model?: string;
  year?: number;
}

export async function findProducts(filters: ProductFilters = {}) {
  const conditions = [sql`${products.archivedAt} is null`];

  if (filters.brandSlug) {
    const [brand] = await db.select({ id: brands.id }).from(brands).where(eq(brands.slug, filters.brandSlug));
    if (!brand) return [];
    conditions.push(eq(products.brandId, brand.id));
  }

  const requestedCategories = filters.categorySlugs?.length ? filters.categorySlugs : filters.categorySlug ? [filters.categorySlug] : [];
  if (requestedCategories.length > 0) {
    const categoryRows = await db.select({ id: categories.id }).from(categories).where(inArray(categories.slug, requestedCategories));
    if (!categoryRows.length) return [];
    conditions.push(inArray(products.categoryId, categoryRows.map((row) => row.id)));
  }

  if (filters.vehicleType) conditions.push(eq(products.vehicleType, filters.vehicleType));

  if (filters.model) {
    const modelTerm = `%${filters.model.trim()}%`;
    conditions.push(sql`exists (select 1 from ${productCompatibility} pc where pc.product_id = ${products.id} and pc.model_name ilike ${modelTerm})`);
  }

  if (typeof filters.year === "number" && Number.isFinite(filters.year)) {
    const yearText = String(filters.year);
    const normalizedYears = sql`regexp_replace(lower(pc.years), '\\s', '', 'g')`;
    conditions.push(sql`exists (
      select 1 from ${productCompatibility} pc
      where pc.product_id = ${products.id}
        and (
          pc.years ilike ${`%${yearText}%`}
          or (
            ${normalizedYears} ~ '^\d{4}-(\d{4}|present)$'
            and split_part(${normalizedYears}, '-', 1)::int <= ${filters.year}
            and case
              when split_part(${normalizedYears}, '-', 2) = 'present' then true
              else split_part(${normalizedYears}, '-', 2)::int >= ${filters.year}
            end
          )
        )
    )`);
  }

  if (filters.partType && filters.partType.length > 0) {
    conditions.push(inArray(products.partType, filters.partType));
  }

  if (typeof filters.priceMin === "number") conditions.push(gte(products.price, filters.priceMin));
  if (typeof filters.priceMax === "number") conditions.push(lte(products.price, filters.priceMax));
  if (filters.inStockOnly) conditions.push(sql`${products.stock} > 0`);

  if (filters.query && filters.query.trim().length >= 3) {
    const term = `%${filters.query.trim()}%`;
    conditions.push(or(
      ilike(products.name, term),
      ilike(products.description, term),
      ilike(products.modelYears, term),
      ilike(products.partType, term),
      sql`exists (select 1 from ${brands} where ${brands.id} = ${products.brandId} and ${brands.name} ilike ${term})`,
      sql`exists (select 1 from ${categories} where ${categories.id} = ${products.categoryId} and ${categories.name} ilike ${term})`
    )!);
  }

  const orderBy =
    filters.sort === "price-asc"
      ? asc(products.price)
      : filters.sort === "price-desc"
      ? desc(products.price)
      : filters.sort === "rating"
      ? desc(products.rating)
      : filters.sort === "newest"
      ? desc(products.createdAt)
      : desc(products.reviewCount); // popularity default

  const rows = await db.query.products.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [orderBy],
    limit: filters.limit,
    offset: filters.offset,
    with: {
      brand: true,
      category: true,
      images: { orderBy: (img, { asc }) => [asc(img.sortOrder)] },
    },
  });

  return rows;
}

export async function findProductBySlug(slug: string) {
  return db.query.products.findFirst({
    where: and(eq(products.slug, slug), sql`${products.archivedAt} is null`),
    with: {
      brand: true,
      category: true,
      images: { orderBy: (img, { asc }) => [asc(img.sortOrder)] },
      compatibility: true,
      specifications: { orderBy: (s, { asc }) => [asc(s.sortOrder)] },
      reviews: { where: (r,{eq})=>eq(r.status,"approved"), with: { user: true } },
    },
  });
}

export async function findRelatedProducts(categoryId: string, excludeId: string, limit = 4) {
  return db.query.products.findMany({
    where: and(eq(products.categoryId, categoryId), sql`${products.id} != ${excludeId}`, sql`${products.archivedAt} is null`),
    limit,
    with: { brand: true, images: { orderBy: (img, { asc }) => [asc(img.sortOrder)] } },
  });
}

export async function getAllBrands() {
  const rows = await db
    .select({
      id: brands.id,
      slug: brands.slug,
      name: brands.name,
      logo: brands.logo,
      vehicleImage: brands.vehicleImage,
      vehicleType: brands.vehicleType,
      description: brands.description,
      coverImage: brands.coverImage,
      productCount: sql<number>`count(${products.id})::int`,
    })
    .from(brands)
    .leftJoin(products, and(eq(products.brandId, brands.id), sql`${products.archivedAt} is null`))
    .where(eq(brands.active, true))
    .groupBy(brands.id)
    .orderBy(asc(brands.sortOrder), asc(brands.name));

  return rows;
}

export async function getAllCategories() {
  const rows = await db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      image: categories.image,
      icon: categories.icon,
      coverImage: categories.coverImage,
      description: categories.description,
      productCount: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .leftJoin(products, and(eq(products.categoryId, categories.id), sql`${products.archivedAt} is null`))
    .where(eq(categories.active, true))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  return rows;
}

export async function getBrandBySlugDb(slug: string) {
  const [brand] = await db
    .select({
      id: brands.id, slug: brands.slug, name: brands.name, logo: brands.logo, vehicleImage: brands.vehicleImage,
      vehicleType: brands.vehicleType, description: brands.description, coverImage: brands.coverImage, active: brands.active,
      sortOrder: brands.sortOrder, createdAt: brands.createdAt, productCount: sql<number>`count(${products.id})::int`,
    })
    .from(brands)
    .leftJoin(products, and(eq(products.brandId, brands.id), sql`${products.archivedAt} is null`))
    .where(and(eq(brands.slug, slug), eq(brands.active, true)))
    .groupBy(brands.id)
    .limit(1);
  return brand;
}
