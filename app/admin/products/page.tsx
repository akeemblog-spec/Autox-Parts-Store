import type { Metadata } from "next";
import { and, asc, eq, ilike, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { brands, categories, partTypes, products, vehicleTypes } from "@/db/schema";
import { AdminProductsManager } from "@/components/admin/AdminProductsManager";
import { Pagination } from "@/components/ui/Pagination";
import { parsePagination } from "@/lib/pagination";

export const metadata: Metadata = { title: "Manage Products" };
export const dynamic = "force-dynamic";

type ProductStatus = "active" | "archived" | "all";

export default async function AdminProductsPage({searchParams}:{searchParams:Promise<{page?:string;limit?:string;q?:string;status?:string}>}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const status: ProductStatus = params.status === "archived" || params.status === "all" ? params.status : "active";
  const { page, limit, offset } = parsePagination(params);
  const conditions = [];
  if (q) conditions.push(ilike(products.name, `%${q}%`));
  if (status === "active") conditions.push(isNull(products.archivedAt));
  if (status === "archived") conditions.push(isNotNull(products.archivedAt));
  const where = conditions.length ? and(...conditions) : undefined;

  const [productRows,totalRows,brandRows,categoryRows,vehicleRows,partRows] = await Promise.all([
    db.query.products.findMany({where,orderBy:(p,{desc})=>[desc(p.createdAt)],limit,offset,with:{brand:true,category:true,images:{orderBy:(img,{asc})=>[asc(img.sortOrder)],limit:1}}}),
    db.select({count:sql<number>`count(*)::int`}).from(products).where(where),
    db.select({ id: brands.id, name: brands.name }).from(brands).where(eq(brands.active,true)).orderBy(asc(brands.name)),
    db.select({ id: categories.id, name: categories.name }).from(categories).where(eq(categories.active,true)).orderBy(asc(categories.name)),
    db.select({ slug: vehicleTypes.slug, name: vehicleTypes.name }).from(vehicleTypes).where(eq(vehicleTypes.active,true)).orderBy(asc(vehicleTypes.sortOrder)),
    db.select({ slug: partTypes.slug, name: partTypes.name }).from(partTypes).where(eq(partTypes.active,true)).orderBy(asc(partTypes.sortOrder)),
  ]);
  const total = totalRows[0]?.count ?? 0;
  return <><AdminProductsManager initialProducts={productRows} brands={brandRows} categories={categoryRows} vehicleTypes={vehicleRows} partTypes={partRows} totalCount={total} searchQuery={q} status={status}/><Pagination page={page} pageSize={limit} total={total} pathname="/admin/products" params={{q,status}}/></>;
}
