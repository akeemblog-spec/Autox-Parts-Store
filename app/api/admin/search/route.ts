import { NextRequest, NextResponse } from "next/server";
import { desc, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { orders, products, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-guards";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });
  const term = `%${q.slice(0, 80)}%`;
  const [orderRows, productRows, customerRows] = await Promise.all([
    db.select({ id: orders.id, orderNumber: orders.orderNumber, status: orders.status, total: orders.total, createdAt: orders.createdAt }).from(orders).where(ilike(orders.orderNumber, term)).orderBy(desc(orders.createdAt)).limit(5),
    db.select({ id: products.id, name: products.name, slug: products.slug, stock: products.stock, price: products.price }).from(products).where(or(ilike(products.name, term), ilike(products.slug, term), ilike(products.modelYears, term))).limit(5),
    db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone }).from(users).where(or(ilike(users.name, term), ilike(users.email, term), ilike(users.phone, term))).limit(5),
  ]);
  const results = [
    ...orderRows.map((r) => ({ type: "order" as const, id: r.id, title: r.orderNumber, subtitle: `${r.status.replaceAll("_", " ")} · LKR ${Math.round(r.total).toLocaleString()}`, href: `/admin/orders` })),
    ...productRows.map((r) => ({ type: "product" as const, id: r.id, title: r.name, subtitle: `${r.stock} in stock · LKR ${Math.round(r.price).toLocaleString()}`, href: `/admin/products` })),
    ...customerRows.map((r) => ({ type: "customer" as const, id: r.id, title: r.name || r.email, subtitle: r.name ? r.email : (r.phone || "Customer"), href: `/admin/customers?q=${encodeURIComponent(r.email)}` })),
  ];
  return NextResponse.json({ results });
}
