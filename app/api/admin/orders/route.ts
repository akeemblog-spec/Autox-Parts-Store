import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-guards";

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  const rows = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    with: { items: true, user: { columns: { name: true, email: true } } },
  });

  return NextResponse.json({ orders: rows });
}
