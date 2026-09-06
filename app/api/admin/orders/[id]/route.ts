import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orders, orderStatusHistory, users, orderItems, products, inventoryMovements } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentAccount, requireAdmin } from "@/lib/auth-guards";
import { writeAdminAudit } from "@/lib/security/audit";
import { historyMeta } from "@/lib/order-status";
import { sendOrderStatusEmail } from "@/lib/email/send-auth-email";

const statusSchema = z.object({
  status: z.enum(["pending", "paid", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  const { id } = await params;
  if (guard) return guard;

  const actor = await getCurrentAccount();
  const body = await req.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const updated = await db.transaction(async (tx) => {
    const [current] = await tx.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!current) return null;
    if (current.status === parsed.data.status) return { order: current, history: null };
    if (current.status === "cancelled" && parsed.data.status !== "cancelled") throw new Error("CANCELLED_FINAL");
    if (parsed.data.status === "cancelled" && current.status !== "cancelled") { const items=await tx.select().from(orderItems).where(eq(orderItems.orderId,id)); for(const item of items){await tx.update(products).set({stock:sql`${products.stock}+${item.quantity}`,updatedAt:new Date()}).where(eq(products.id,item.productId));await tx.insert(inventoryMovements).values({productId:item.productId,orderId:id,actorUserId:actor?.id,quantityChange:item.quantity,reason:"Order cancelled"});} }
    const [row] = await tx.update(orders).set({ status: parsed.data.status }).where(eq(orders.id, id)).returning();
    const meta = historyMeta(parsed.data.status);
    const [history] = await tx.insert(orderStatusHistory).values({ orderId: id, status: meta.key, title: meta.label, description: meta.description }).returning();
    return { order: row, history };
  });
  if (!updated) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (updated.history) { const [customer]=await db.select({email:users.email}).from(users).where(eq(users.id,updated.order.userId)).limit(1); if(customer?.email) await sendOrderStatusEmail(customer.email,updated.order.orderNumber,updated.order.status).catch(()=>null); }
  if (actor && updated.history) await writeAdminAudit({ actorUserId: actor.id, action: "order.status_updated", targetType: "order", targetId: id, metadata: { status: parsed.data.status } });
  return NextResponse.json(updated);
}
