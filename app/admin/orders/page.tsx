import type { Metadata } from "next";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { Pagination } from "@/components/ui/Pagination";
import { parsePagination } from "@/lib/pagination";

export const metadata: Metadata = { title: "Manage Orders" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({searchParams}:{searchParams:Promise<{page?:string;limit?:string}>}) {
  const params=await searchParams; const {page,limit,offset}=parsePagination(params);
  const [rows,totalRow]=await Promise.all([
    db.query.orders.findMany({orderBy:[desc(orders.createdAt)],limit,offset,with:{items:{with:{product:{with:{images:{orderBy:(img,{asc})=>[asc(img.sortOrder)],limit:1},brand:true}}}},user:{columns:{name:true,email:true,phone:true}},address:true,statusHistory:{orderBy:(h,{asc})=>[asc(h.createdAt)]}}}),
    db.select({count:sql<number>`count(*)::int`}).from(orders),
  ]);
  const total=totalRow[0]?.count??0;
  return <div><div className="mb-6"><h1 className="mb-1 text-2xl font-extrabold text-white">Orders</h1><p className="text-sm text-autox-gray">{total} order{total!==1?'s':''} total. Update status as orders progress.</p></div><AdminOrdersTable initialOrders={rows}/><Pagination page={page} pageSize={limit} total={total} pathname="/admin/orders"/></div>;
}
