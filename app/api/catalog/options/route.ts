import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { brands, categories, partTypes, vehicleModels, vehicleTypes } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const [partRows, vehicleRows, brandRows, categoryRows, modelRows] = await Promise.all([
    db.select({ label: partTypes.name, value: partTypes.slug }).from(partTypes).where(eq(partTypes.active, true)).orderBy(asc(partTypes.sortOrder), asc(partTypes.name)),
    db.select({ label: vehicleTypes.name, value: vehicleTypes.slug }).from(vehicleTypes).where(eq(vehicleTypes.active, true)).orderBy(asc(vehicleTypes.sortOrder), asc(vehicleTypes.name)),
    db.select({ id: brands.id, label: brands.name, value: brands.slug, vehicleType: brands.vehicleType }).from(brands).where(eq(brands.active, true)).orderBy(asc(brands.sortOrder), asc(brands.name)),
    db.select({ id: categories.id, label: categories.name, value: categories.slug }).from(categories).where(eq(categories.active, true)).orderBy(asc(categories.sortOrder), asc(categories.name)),
    db.select({ id: vehicleModels.id, label: vehicleModels.name, value: vehicleModels.slug, brandId: vehicleModels.brandId, yearFrom: vehicleModels.yearFrom, yearTo: vehicleModels.yearTo }).from(vehicleModels).orderBy(asc(vehicleModels.name)),
  ]);

  return NextResponse.json({ partTypes: partRows, vehicleTypes: vehicleRows, brands: brandRows, categories: categoryRows, models: modelRows });
}
