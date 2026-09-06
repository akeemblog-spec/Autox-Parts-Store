import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getCurrentAccount, requireAdmin } from "@/lib/auth-guards";
import { writeAdminAudit } from "@/lib/security/audit";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdmin(); if (guard) return guard;
  const actor = await getCurrentAccount();
  const { id } = await params;
  const parsed = z.object({ archived: z.boolean() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid archive action" }, { status: 400 });
  const archivedAt = parsed.data.archived ? new Date() : null;
  const [updated] = await db.update(products).set({ archivedAt, updatedAt: new Date() }).where(eq(products.id, id)).returning({ id: products.id, name: products.name, archivedAt: products.archivedAt });
  if (!updated) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (actor) await writeAdminAudit({ actorUserId: actor.id, action: parsed.data.archived ? "product.archived" : "product.restored", targetType: "product", targetId: id, metadata: { name: updated.name } });
  return NextResponse.json({ success: true, product: updated });
}
