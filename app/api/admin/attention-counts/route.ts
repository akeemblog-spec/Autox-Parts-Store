import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders,reviews,contactMessages,returnRequests,products,users } from "@/db/schema";
import { and,eq,isNull,lte,or,sql } from "drizzle-orm";
import { getCurrentAccount,requireAdmin } from "@/lib/auth-guards";
export async function GET(){const guard=await requireAdmin();if(guard)return guard;const me=await getCurrentAccount();const [o,r,m,rr,p,a]=await Promise.all([
 db.select({n:sql<number>`count(*)`}).from(orders).where(eq(orders.status,"pending")),
 db.select({n:sql<number>`count(*)`}).from(reviews).where(eq(reviews.status,"pending")),
 db.select({n:sql<number>`count(*)`}).from(contactMessages).where(sql`${contactMessages.readAt} is null`),
 db.select({n:sql<number>`count(*)`}).from(returnRequests).where(eq(returnRequests.status,"pending")),
 db.select({n:sql<number>`count(*)`}).from(products).where(and(lte(products.stock,10),isNull(products.archivedAt))),
 me?.role==="super_admin"?db.select({n:sql<number>`count(*)`}).from(users).where(and(eq(users.role,"admin"),or(eq(users.adminInviteStatus,"pending"),eq(users.active,false)))):Promise.resolve([{n:0}])
]);return NextResponse.json({orders:Number(o[0]?.n||0),reviews:Number(r[0]?.n||0),messages:Number(m[0]?.n||0),returns:Number(rr[0]?.n||0),products:Number(p[0]?.n||0),adminAccounts:Number(a[0]?.n||0)});}
