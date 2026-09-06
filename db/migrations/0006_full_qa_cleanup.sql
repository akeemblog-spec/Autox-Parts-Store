ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "is_saved" boolean DEFAULT true NOT NULL;

-- Every checkout in previous versions created a dedicated order-address row.
-- Keep those immutable order snapshots, but hide them from the customer's saved address book.
UPDATE "addresses"
SET "is_saved" = false,
    "is_default" = false
WHERE "id" IN (
  SELECT "address_id"
  FROM "orders"
  WHERE "address_id" IS NOT NULL
);

-- Guarantee each customer still has at most one visible default address.
WITH ranked AS (
  SELECT "id", "user_id",
         row_number() OVER (PARTITION BY "user_id" ORDER BY "is_default" DESC, "id") AS rn
  FROM "addresses"
  WHERE "is_saved" = true
)
UPDATE "addresses" a
SET "is_default" = false
FROM ranked r
WHERE a."id" = r."id" AND r.rn > 1 AND a."is_default" = true;

WITH first_saved AS (
  SELECT DISTINCT ON ("user_id") "id", "user_id"
  FROM "addresses"
  WHERE "is_saved" = true
  ORDER BY "user_id", "is_default" DESC, "id"
)
UPDATE "addresses" a
SET "is_default" = true
FROM first_saved f
WHERE a."id" = f."id"
  AND NOT EXISTS (
    SELECT 1 FROM "addresses" d
    WHERE d."user_id" = f."user_id" AND d."is_saved" = true AND d."is_default" = true
  );

-- Clean up historical duplicate wishlist/compare rows, then enforce one row per user/product.
DELETE FROM "wishlist_items" a
USING "wishlist_items" b
WHERE a."user_id" = b."user_id"
  AND a."product_id" = b."product_id"
  AND a."id" > b."id";

DELETE FROM "compare_items" a
USING "compare_items" b
WHERE a."user_id" = b."user_id"
  AND a."product_id" = b."product_id"
  AND a."id" > b."id";

CREATE UNIQUE INDEX IF NOT EXISTS "wishlist_user_product_unique"
  ON "wishlist_items" ("user_id", "product_id");
CREATE UNIQUE INDEX IF NOT EXISTS "compare_user_product_unique"
  ON "compare_items" ("user_id", "product_id");
CREATE UNIQUE INDEX IF NOT EXISTS "addresses_one_saved_default_per_user"
  ON "addresses" ("user_id")
  WHERE "is_saved" = true AND "is_default" = true;
