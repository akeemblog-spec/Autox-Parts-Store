import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { products, wishlistItems } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.invalidated) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const items = await db.query.wishlistItems.findMany({
    where: eq(wishlistItems.userId, session.user.id),
    with: { product: { with: { images: { orderBy: (img, { asc }) => [asc(img.sortOrder)], limit: 1 } } } },
  });

  return NextResponse.json({ items: items.filter((item) => !item.product.archivedAt) });
}

const addSchema = z.object({ productId: z.string().uuid() });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.invalidated) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const [available] = await db.select({ id: products.id }).from(products).where(and(eq(products.id, parsed.data.productId), isNull(products.archivedAt))).limit(1);
  if (!available) return NextResponse.json({ error: "This product is no longer available." }, { status: 409 });

  const [existing] = await db
    .select()
    .from(wishlistItems)
    .where(and(eq(wishlistItems.userId, session.user.id), eq(wishlistItems.productId, parsed.data.productId)))
    .limit(1);

  if (existing) return NextResponse.json({ item: existing });

  const [created] = await db
    .insert(wishlistItems)
    .values({ userId: session.user.id, productId: parsed.data.productId })
    .onConflictDoNothing()
    .returning();

  if (!created) {
    const [item] = await db.select().from(wishlistItems).where(and(eq(wishlistItems.userId, session.user.id), eq(wishlistItems.productId, parsed.data.productId))).limit(1);
    return NextResponse.json({ item, alreadyAdded: true });
  }
  return NextResponse.json({ item: created }, { status: 201 });
}
