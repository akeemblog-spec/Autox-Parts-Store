import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { cartItems, carts, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

async function assertOwnsItem(userId: string, itemId: string) {
  const [item] = await db
    .select({ cartId: cartItems.cartId, cartUserId: carts.userId })
    .from(cartItems)
    .innerJoin(carts, eq(cartItems.cartId, carts.id))
    .where(eq(cartItems.id, itemId))
    .limit(1);

  return item && item.cartUserId === userId;
}

const updateSchema = z.object({ quantity: z.number().int().positive() });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const session = await auth();
  const { itemId } = await params;
  if (!session?.user?.id || session.user.invalidated) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (!(await assertOwnsItem(session.user.id, itemId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const [itemWithProduct] = await db
    .select({ stock: products.stock })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.id, itemId))
    .limit(1);

  if (!itemWithProduct) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (parsed.data.quantity > itemWithProduct.stock) {
    return NextResponse.json({ error: `Only ${itemWithProduct.stock} item(s) available` }, { status: 409 });
  }

  const [updated] = await db
    .update(cartItems)
    .set({ quantity: parsed.data.quantity })
    .where(eq(cartItems.id, itemId))
    .returning();

  return NextResponse.json({ item: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const session = await auth();
  const { itemId } = await params;
  if (!session?.user?.id || session.user.invalidated) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (!(await assertOwnsItem(session.user.id, itemId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(cartItems).where(eq(cartItems.id, itemId));
  return NextResponse.json({ success: true });
}
