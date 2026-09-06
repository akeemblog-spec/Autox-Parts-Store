import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { carts, cartItems, products } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { auth } from "@/auth";

async function getOrCreateCart(userId: string) {
  const [existing] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  if (existing) return existing;

  const [created] = await db.insert(carts).values({ userId }).returning();
  return created;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.invalidated) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const cart = await getOrCreateCart(session.user.id);

  const items = await db.query.cartItems.findMany({
    where: eq(cartItems.cartId, cart.id),
    with: { product: { with: { images: { orderBy: (img, { asc }) => [asc(img.sortOrder)], limit: 1 } } } },
  });

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return NextResponse.json({ items, subtotal });
}

const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.invalidated) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = addItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [product] = await db.select().from(products).where(and(eq(products.id, parsed.data.productId), isNull(products.archivedAt))).limit(1);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (product.stock <= 0) {
    return NextResponse.json({ error: "Product is out of stock" }, { status: 409 });
  }

  const cart = await getOrCreateCart(session.user.id);

  const [existingItem] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, parsed.data.productId)))
    .limit(1);

  if (existingItem) {
    const nextQuantity = existingItem.quantity + parsed.data.quantity;
    if (nextQuantity > product.stock) {
      return NextResponse.json({ error: `Only ${product.stock} item(s) available` }, { status: 409 });
    }
    const [updated] = await db
      .update(cartItems)
      .set({ quantity: nextQuantity })
      .where(eq(cartItems.id, existingItem.id))
      .returning();
    return NextResponse.json({ item: updated });
  }

  if (parsed.data.quantity > product.stock) {
    return NextResponse.json({ error: `Only ${product.stock} item(s) available` }, { status: 409 });
  }

  const [created] = await db
    .insert(cartItems)
    .values({ cartId: cart.id, productId: parsed.data.productId, quantity: parsed.data.quantity })
    .returning();

  return NextResponse.json({ item: created }, { status: 201 });
}
