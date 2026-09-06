ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "archived_at" timestamp;

CREATE INDEX IF NOT EXISTS "products_archived_at_idx" ON "products" ("archived_at");
