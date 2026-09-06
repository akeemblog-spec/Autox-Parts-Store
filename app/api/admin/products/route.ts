import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { productCompatibility, productImages, products, productSpecifications } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-guards";

const imageSchema = z.object({ url: z.string().min(1), alt: z.string().min(1), sortOrder: z.number().int().min(0).default(0) });
const compatibilitySchema = z.object({ brandName: z.string().min(1), modelName: z.string().min(1), years: z.string().min(1) });
const specificationSchema = z.object({ label: z.string().min(1), value: z.string().min(1), sortOrder: z.number().int().min(0).default(0) });

const productBaseSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only contain lowercase letters, numbers and hyphens"),
  name: z.string().min(1),
  brandId: z.string().uuid(),
  categoryId: z.string().uuid(),
  vehicleType: z.string().min(1),
  modelYears: z.string().min(1),
  partType: z.string().min(1),
  price: z.number().positive(),
  previousPrice: z.number().positive().nullable().optional(),
  discount: z.number().int().min(0).max(100).nullable().optional(),
  stock: z.number().int().min(0),
  genuine: z.boolean(),
  installmentAvailable: z.boolean(),
  description: z.string().min(1),
  warranty: z.string().min(1),
  deliveryEstimate: z.string().min(1),
  images: z.array(imageSchema).default([]),
  compatibility: z.array(compatibilitySchema).default([]),
  specifications: z.array(specificationSchema).default([]),
});

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;
  const rows = await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    with: { brand: true, category: true, images: { orderBy: (img, { asc }) => [asc(img.sortOrder)], limit: 1 } },
  });
  return NextResponse.json({ products: rows });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const parsed = productBaseSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const { images, compatibility, specifications, ...productData } = parsed.data;
  try {
    const created = await db.transaction(async (tx) => {
      const [product] = await tx.insert(products).values({ ...productData, rating: 0, reviewCount: 0 }).returning();
      if (images.length) await tx.insert(productImages).values(images.map((x) => ({ ...x, productId: product.id })));
      if (compatibility.length) await tx.insert(productCompatibility).values(compatibility.map((x) => ({ ...x, productId: product.id })));
      if (specifications.length) await tx.insert(productSpecifications).values(specifications.map((x) => ({ ...x, productId: product.id })));
      return product;
    });
    return NextResponse.json({ product: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && /unique|duplicate/i.test(error.message) ? "A product with this slug already exists." : "Unable to create product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
