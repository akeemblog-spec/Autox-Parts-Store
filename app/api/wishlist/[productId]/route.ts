import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { wishlistItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const session = await auth();
  const { productId } = await params;
  if (!session?.user?.id || session.user.invalidated) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await db
    .delete(wishlistItems)
    .where(and(eq(wishlistItems.userId, session.user.id), eq(wishlistItems.productId, productId)));

  return NextResponse.json({ success: true });
}
