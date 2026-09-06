import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { addresses } from "@/db/schema";

const schema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(1).max(60),
  line1: z.string().trim().min(1).max(180),
  line2: z.string().trim().max(180).nullable().optional(),
  city: z.string().trim().min(1).max(100),
  district: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().max(20).nullable().optional(),
  phone: z.string().trim().min(7).max(30),
  isDefault: z.boolean(),
});

async function currentUserId() {
  const session = await auth();
  return session?.user?.id && !session.user.invalidated ? session.user.id : null;
}

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const rows = await db.query.addresses.findMany({
    where: and(eq(addresses.userId, userId), eq(addresses.isSaved, true)),
  });
  return NextResponse.json({ addresses: rows });
}

export async function POST(req: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid address" }, { status: 400 });

  const { id: _id, ...input } = parsed.data;
  const row = await db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: addresses.id })
      .from(addresses)
      .where(and(eq(addresses.userId, userId), eq(addresses.isSaved, true)));
    const data = { ...input, isSaved: true, isDefault: input.isDefault || existing.length === 0 };
    if (data.isDefault) {
      await tx.update(addresses).set({ isDefault: false }).where(and(eq(addresses.userId, userId), eq(addresses.isSaved, true)));
    }
    const [created] = await tx.insert(addresses).values({ ...data, userId }).returning();
    return created;
  });
  return NextResponse.json({ address: row }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !parsed.data.id) return NextResponse.json({ error: "Invalid address" }, { status: 400 });

  const { id, ...data } = parsed.data;
  const row = await db.transaction(async (tx) => {
    if (data.isDefault) {
      await tx.update(addresses).set({ isDefault: false }).where(and(eq(addresses.userId, userId), eq(addresses.isSaved, true)));
    }
    const [updated] = await tx
      .update(addresses)
      .set({ ...data, isSaved: true })
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId), eq(addresses.isSaved, true)))
      .returning();
    if (!updated) return null;

    const defaults = await tx
      .select({ id: addresses.id })
      .from(addresses)
      .where(and(eq(addresses.userId, userId), eq(addresses.isSaved, true), eq(addresses.isDefault, true)));
    if (defaults.length === 0) {
      await tx.update(addresses).set({ isDefault: true }).where(eq(addresses.id, updated.id));
      updated.isDefault = true;
    }
    return updated;
  });

  return row ? NextResponse.json({ address: row }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(req: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id || !z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid address id" }, { status: 400 });

  await db.transaction(async (tx) => {
    const [target] = await tx
      .select({ isDefault: addresses.isDefault })
      .from(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId), eq(addresses.isSaved, true)))
      .limit(1);
    if (!target) return;
    await tx.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, userId), eq(addresses.isSaved, true)));
    if (target.isDefault) {
      const [next] = await tx
        .select({ id: addresses.id })
        .from(addresses)
        .where(and(eq(addresses.userId, userId), eq(addresses.isSaved, true)))
        .limit(1);
      if (next) await tx.update(addresses).set({ isDefault: true }).where(eq(addresses.id, next.id));
    }
  });
  return NextResponse.json({ ok: true });
}
