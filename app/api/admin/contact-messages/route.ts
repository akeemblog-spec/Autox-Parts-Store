import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { getCurrentAccount, requireAdmin } from "@/lib/auth-guards";
import { writeAdminAudit } from "@/lib/security/audit";

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;
  const messages = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  return NextResponse.json({ messages });
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const actor = await getCurrentAccount();
  if (!actor) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const body = await req.json().catch(() => null) as { id?: string; resolved?: boolean; read?: boolean } | null;
  if (!body?.id || (typeof body.resolved !== "boolean" && typeof body.read !== "boolean")) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const patch: {resolved?:boolean;readAt?:Date|null}={}; if(typeof body.resolved==="boolean")patch.resolved=body.resolved;if(typeof body.read==="boolean")patch.readAt=body.read?new Date():null;
  const [updated] = await db.update(contactMessages).set(patch).where(eq(contactMessages.id, body.id)).returning();
  if (!updated) return NextResponse.json({ error: "Message not found" }, { status: 404 });
  await writeAdminAudit({ actorUserId: actor.id, action: typeof body.resolved === "boolean" ? (body.resolved ? "contact_message.resolved" : "contact_message.reopened") : "contact_message.read", targetType: "contact_message", targetId: body.id });
  return NextResponse.json({ message: updated });
}
