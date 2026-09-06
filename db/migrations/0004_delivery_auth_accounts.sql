ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true NOT NULL;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_method" text DEFAULT 'standard' NOT NULL;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "standard_delivery_fee" real DEFAULT 0 NOT NULL;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "express_delivery_fee" real DEFAULT 0 NOT NULL;
UPDATE "users" SET "email_verified" = COALESCE("created_at", now()) WHERE "email_verified" IS NULL;
UPDATE "orders" SET "standard_delivery_fee" = "delivery_fee" WHERE "standard_delivery_fee" = 0 AND "delivery_fee" > 0;
