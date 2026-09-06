import { db } from "./index";
import bcrypt from "bcryptjs";
import {
  users,
  brands,
  categories,
  vehicleModels,
  products,
  productImages,
  productCompatibility,
  productSpecifications,
  paymentMethods,
} from "./schema";

// Reuse the same mock data that powers the static frontend so the DB and
// the original design stay in sync. These imports pull from lib/data —
// once you're live, keep using this seed for local/dev resets, but treat
// the database as the source of truth from here on.
import { bikeBrands, threeWheelerBrands } from "../lib/data/brands";
import { categories as categoryData } from "../lib/data/categories";
import { hondaModels } from "../lib/data/models";
import { products as productData } from "../lib/data/products";

const partTypeMap: Record<string, "genuine_honda" | "genuine" | "oem" | "aftermarket"> = {
  "Genuine Honda": "genuine_honda",
  Genuine: "genuine",
  OEM: "oem",
  Aftermarket: "aftermarket",
};

async function main() {
  if (process.env.NODE_ENV === "production" || process.env.ALLOW_DEV_SEED_ADMIN !== "true") {
    throw new Error("Database seeding is disabled. Set ALLOW_DEV_SEED_ADMIN=true only for an isolated development database.");
  }
  if (!process.env.DEV_SEED_ADMIN_PASSWORD || process.env.DEV_SEED_ADMIN_PASSWORD.length < 12) {
    throw new Error("Set DEV_SEED_ADMIN_PASSWORD to a unique development-only password of at least 12 characters.");
  }
  console.log("Seeding development database...");

  // --- Admin user -----------------------------------------------------
  const adminPasswordHash = await bcrypt.hash(process.env.DEV_SEED_ADMIN_PASSWORD, 12);
  const [admin] = await db
    .insert(users)
    .values({
      name: "AutoX Admin",
      email: "admin@autoxparts.lk",
      passwordHash: adminPasswordHash,
      role: "admin",
    })
    .onConflictDoNothing({ target: users.email })
    .returning();
  console.log(admin ? `  ✓ Admin user: ${admin.email}` : "  · Admin user already exists");

  // --- Brands -----------------------------------------------------------
  const allBrandData = [...bikeBrands, ...threeWheelerBrands];
  const brandRows = await db
    .insert(brands)
    .values(
      allBrandData.map((b) => ({
        slug: b.slug,
        name: b.name,
        logo: b.logo,
        vehicleImage: b.vehicleImage,
        vehicleType: b.vehicleType,
        description: b.description,
      }))
    )
    .onConflictDoNothing({ target: brands.slug })
    .returning();
  const brandBySlug = new Map((await db.select().from(brands)).map((b) => [b.slug, b]));
  console.log(`  ✓ Brands: ${brandRows.length} inserted (${brandBySlug.size} total)`);

  // --- Categories ---------------------------------------------------------
  const categoryRows = await db
    .insert(categories)
    .values(
      categoryData.map((c) => ({
        slug: c.slug,
        name: c.name,
        image: c.image,
        icon: c.icon,
      }))
    )
    .onConflictDoNothing({ target: categories.slug })
    .returning();
  const categoryBySlug = new Map((await db.select().from(categories)).map((c) => [c.slug, c]));
  console.log(`  ✓ Categories: ${categoryRows.length} inserted (${categoryBySlug.size} total)`);

  // --- Honda vehicle models ------------------------------------------------
  const hondaBrand = brandBySlug.get("honda");
  if (hondaBrand) {
    const existingModels = await db.select().from(vehicleModels).limit(1);
    if (existingModels.length === 0) {
      await db.insert(vehicleModels).values(
        hondaModels.map((m) => ({
          slug: m.slug,
          brandId: hondaBrand.id,
          name: m.name,
          image: m.image,
          yearFrom: m.yearFrom,
          yearTo: String(m.yearTo),
        }))
      );
      console.log(`  ✓ Vehicle models: ${hondaModels.length} inserted`);
    } else {
      console.log("  · Vehicle models already seeded");
    }
  }

  // --- Products -------------------------------------------------------
  const existingProducts = await db.select().from(products).limit(1);
  if (existingProducts.length === 0) {
    for (const p of productData) {
      const brand = brandBySlug.get(p.brandSlug);
      const category = categoryBySlug.get(p.categorySlug);
      if (!brand || !category) {
        console.warn(`  ! Skipping ${p.slug} — missing brand/category`);
        continue;
      }

      const [inserted] = await db
        .insert(products)
        .values({
          slug: p.slug,
          name: p.name,
          brandId: brand.id,
          categoryId: category.id,
          vehicleType: p.vehicleType,
          modelYears: p.modelYears,
          partType: partTypeMap[p.partType] ?? "aftermarket",
          price: p.price,
          previousPrice: p.previousPrice,
          discount: p.discount,
          rating: p.rating,
          reviewCount: p.reviewCount,
          stock: p.stock,
          genuine: p.genuine,
          installmentAvailable: p.installmentAvailable,
          description: p.description,
          warranty: p.warranty,
          deliveryEstimate: p.deliveryEstimate,
        })
        .returning();

      if (p.images.length > 0) {
        await db.insert(productImages).values(
          p.images.map((img, idx) => ({
            productId: inserted.id,
            url: img.url,
            alt: img.alt,
            sortOrder: idx,
          }))
        );
      }

      if (p.compatibleModels.length > 0) {
        await db.insert(productCompatibility).values(
          p.compatibleModels.map((c) => ({
            productId: inserted.id,
            brandName: c.brand,
            modelName: c.model,
            years: c.years,
          }))
        );
      }

      if (p.specifications.length > 0) {
        await db.insert(productSpecifications).values(
          p.specifications.map((s, idx) => ({
            productId: inserted.id,
            label: s.label,
            value: s.value,
            sortOrder: idx,
          }))
        );
      }
    }
    console.log(`  ✓ Products: ${productData.length} inserted (with images, compatibility, specs)`);
  } else {
    console.log("  · Products already seeded");
  }

  // --- Payment methods (admin-toggleable) ------------------------------
  const existingMethods = await db.select().from(paymentMethods).limit(1);
  if (existingMethods.length === 0) {
    await db.insert(paymentMethods).values([
      {
        method: "cod",
        label: "Cash on Delivery",
        description: "Pay in cash when your order arrives.",
        enabled: true,
        sortOrder: 0,
      },
      {
        method: "bank_transfer",
        label: "Bank Transfer",
        description: "Pay via direct bank transfer before dispatch.",
        enabled: true,
        sortOrder: 1,
      },
      {
        method: "koko",
        label: "Koko — Pay Later",
        description: "Split your payment into installments with Koko.",
        enabled: false,
        sortOrder: 2,
      },
      {
        method: "mintpay",
        label: "Mintpay — Pay Later",
        description: "Buy now, pay later with Mintpay.",
        enabled: false,
        sortOrder: 3,
      },
    ]);
    console.log("  ✓ Payment methods: 4 inserted (COD + Bank Transfer enabled, Koko + Mintpay disabled)");
  } else {
    console.log("  · Payment methods already seeded");
  }

  console.log("Seed complete.");
  console.log("");
  console.log("Development seed complete. Admin password was supplied via DEV_SEED_ADMIN_PASSWORD and is not printed.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
