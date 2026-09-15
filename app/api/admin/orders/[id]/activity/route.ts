import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { adminAuditLogs, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-guards";

export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
  const guard=await requireAdmin();
  if(guard)return guard;
  const{id}=await params;
  const rows=await db.select({
    id:adminAuditLogs.id,
    action:adminAuditLogs.action,
    metadata:adminAuditLogs.metadata,
    createdAt:adminAuditLogs.createdAt,
    actorName:users.name,
    actorEmail:users.email,
  }).from(adminAuditLogs)
    .leftJoin(users,eq(adminAuditLogs.actorUserId,users.id))
    .where(and(eq(adminAuditLogs.targetType,"order"),eq(adminAuditLogs.targetId,id)))
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(50);
  return NextResponse.json({activity:rows});
}
