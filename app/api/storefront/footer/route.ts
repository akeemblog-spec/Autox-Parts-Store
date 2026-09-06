import { NextResponse } from "next/server";
import { getAllBrands } from "@/lib/db-queries/products";
import { getStorefrontSettings } from "@/lib/db-queries/storefront";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [brands, settings] = await Promise.all([
      getAllBrands(),
      getStorefrontSettings(),
    ]);

    const allBrands = brands.map((brand) => ({ id: brand.id, name: brand.name, slug: brand.slug, vehicleType: brand.vehicleType }));
    const bikeBrands = allBrands.filter((brand) => brand.vehicleType === "bike");
    const threeWheelerBrands = allBrands.filter((brand) => brand.vehicleType === "three-wheeler");

    return NextResponse.json({ bikeBrands, threeWheelerBrands, allBrands, settings });
  } catch (error) {
    console.error("Failed to load footer storefront data", error);
    return NextResponse.json(
      { bikeBrands: [], threeWheelerBrands: [], allBrands: [], settings: {} },
      { status: 500 },
    );
  }
}
