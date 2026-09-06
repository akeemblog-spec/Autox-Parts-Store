import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { AdminMessagesManager } from "@/components/admin/AdminMessagesManager";
import { Pagination } from "@/components/ui/Pagination";
import { parsePagination } from "@/lib/pagination";
export const dynamic = "force-dynamic";
export default async function AdminMessagesPage({searchParams}:{searchParams:Promise<{page?:string;limit?:string;filter?:string}>}){const params=await searchParams;const filter=(['all','open','resolved'].includes(params.filter||'')?params.filter:'open') as 'all'|'open'|'resolved';const{page,limit,offset}=parsePagination(params);const where=filter==='all'?undefined:eq(contactMessages.resolved,filter==='resolved');const [rows,c]=await Promise.all([db.select().from(contactMessages).where(where).orderBy(desc(contactMessages.createdAt)).limit(limit).offset(offset),db.select({count:sql<number>`count(*)::int`}).from(contactMessages).where(where)]);const total=c[0]?.count??0;return <><AdminMessagesManager initial={rows} filter={filter}/><Pagination page={page} pageSize={limit} total={total} pathname="/admin/messages" params={{filter}}/></>}
