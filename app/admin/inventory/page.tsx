import { db } from '@/db';
import { products } from '@/db/schema';
import { and, asc, ilike, isNull, sql } from 'drizzle-orm';
import { AdminInventoryManager } from '@/components/admin/AdminInventoryManager';
import { Pagination } from '@/components/ui/Pagination';
import { parsePagination } from '@/lib/pagination';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{page?:string;limit?:string;q?:string}>}){const params=await searchParams;const q=params.q?.trim()||'';const {page,limit,offset}=parsePagination(params);const where=and(isNull(products.archivedAt),...(q?[ilike(products.name,`%${q}%`)]:[]));const [rows,countRows]=await Promise.all([db.query.products.findMany({where,orderBy:[asc(products.stock)],limit,offset,with:{brand:true,category:true}}),db.select({count:sql<number>`count(*)::int`}).from(products).where(where)]);const total=countRows[0]?.count??0;return <div><AdminInventoryManager initial={rows} totalCount={total} searchQuery={q}/><Pagination page={page} pageSize={limit} total={total} pathname="/admin/inventory" params={{q}}/></div>}
