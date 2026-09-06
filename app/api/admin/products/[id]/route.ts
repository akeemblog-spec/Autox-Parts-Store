import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { inventoryMovements, orderItems, productCompatibility, productImages, products, productSpecifications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentAccount, requireAdmin } from "@/lib/auth-guards";
import { writeAdminAudit } from "@/lib/security/audit";

const imageSchema = z.object({ url: z.string().min(1), alt: z.string().min(1), sortOrder: z.number().int().min(0).default(0) });
const compatibilitySchema = z.object({ brandName: z.string().min(1), modelName: z.string().min(1), years: z.string().min(1) });
const specificationSchema = z.object({ label: z.string().min(1), value: z.string().min(1), sortOrder: z.number().int().min(0).default(0) });

const updateSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(), name: z.string().min(1).optional(), brandId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(), vehicleType: z.string().min(1).optional(), modelYears: z.string().min(1).optional(),
  partType: z.string().min(1).optional(), price: z.number().positive().optional(), previousPrice: z.number().positive().nullable().optional(),
  discount: z.number().int().min(0).max(100).nullable().optional(), stock: z.number().int().min(0).optional(), genuine: z.boolean().optional(),
  installmentAvailable: z.boolean().optional(), description: z.string().min(1).optional(), warranty: z.string().min(1).optional(), deliveryEstimate: z.string().min(1).optional(),
  images: z.array(imageSchema).optional(), compatibility: z.array(compatibilitySchema).optional(), specifications: z.array(specificationSchema).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const guard = await requireAdmin(); if (guard) return guard;
  const { id } = await params;
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      brand: true, category: true,
      images: { orderBy: (img, { asc }) => [asc(img.sortOrder)] },
      compatibility: true,
      specifications: { orderBy: (spec, { asc }) => [asc(spec.sortOrder)] },
    },
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdmin(); if (guard) return guard;
  const actor = await getCurrentAccount();
  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const { images, compatibility, specifications, ...productData } = parsed.data;

  try {
    const updated = await db.transaction(async (tx) => {
      const [product] = await tx.update(products).set({ ...productData, updatedAt: new Date() }).where(eq(products.id, id)).returning();
      if (!product) return null;
      if (images) { await tx.delete(productImages).where(eq(productImages.productId, id)); if (images.length) await tx.insert(productImages).values(images.map((x) => ({ ...x, productId: id }))); }
      if (compatibility) { await tx.delete(productCompatibility).where(eq(productCompatibility.productId, id)); if (compatibility.length) await tx.insert(productCompatibility).values(compatibility.map((x) => ({ ...x, productId: id }))); }
      if (specifications) { await tx.delete(productSpecifications).where(eq(productSpecifications.productId, id)); if (specifications.length) await tx.insert(productSpecifications).values(specifications.map((x) => ({ ...x, productId: id }))); }
      return product;
    });
    if (!updated) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    if (actor) await writeAdminAudit({ actorUserId: actor.id, action: "product.updated", targetType: "product", targetId: id, metadata: { changedFields: Object.keys(productData), imagesChanged: Boolean(images), compatibilityChanged: Boolean(compatibility), specificationsChanged: Boolean(specifications) } });
    return NextResponse.json({ product: updated });
  } catch (error) {
    const message = error instanceof Error && /unique|duplicate/i.test(error.message) ? "A product with this slug already exists." : "Unable to update product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const guard = await requireAdmin(); if (guard) return guard;
  const actor = await getCurrentAccount();
  const { id } = await params;

  const [existing] = await db.select({ id: products.id, name: products.name, archivedAt: products.archivedAt }).from(products).where(eq(products.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const [orderRefs, movementRefs] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(orderItems).where(eq(orderItems.productId, id)),
    db.select({ count: sql<number>`count(*)::int` }).from(inventoryMovements).where(eq(inventoryMovements.productId, id)),
  ]);
  const hasHistory = (orderRefs[0]?.count ?? 0) > 0 || (movementRefs[0]?.count ?? 0) > 0;
  if (hasHistory) {
    return NextResponse.json({
      error: "PRODUCT_HAS_HISTORY",
      message: "This product has order or inventory history and cannot be permanently deleted.",
      canArchive: true,
      archived: Boolean(existing.archivedAt),
    }, { status: 409 });
  }

  const [deleted] = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
  if (!deleted) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (actor) await writeAdminAudit({ actorUserId: actor.id, action: "product.deleted", targetType: "product", targetId: id, metadata: { name: existing.name } });
  return NextResponse.json({ success: true, deleted: true });
}
