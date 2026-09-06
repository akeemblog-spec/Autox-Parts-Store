import "server-only";
import { headers } from "next/headers";
import { db } from "@/db";
import { adminAuditLogs } from "@/db/schema";

export async function writeAdminAudit(input: { actorUserId: string; action: string; targetType: string; targetId?: string | null; metadata?: Record<string, unknown> }) {
  const h = await headers();
  const ipAddress = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  const userAgent = h.get("user-agent")?.slice(0, 500) || null;
  await db.insert(adminAuditLogs).values({
    actorUserId: input.actorUserId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    ipAddress,
    userAgent,
  });
}
