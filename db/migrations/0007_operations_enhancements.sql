ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'pending' NOT NULL;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "moderated_at" timestamp;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "moderated_by" uuid REFERENCES "users"("id") ON DELETE SET NULL;
DELETE FROM "reviews" a USING "reviews" b WHERE a."created_at" < b."created_at" AND a."user_id"=b."user_id" AND a."product_id"=b."product_id";
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_user_product_unique" ON "reviews" ("user_id","product_id");

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_amount" real DEFAULT 0 NOT NULL;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "coupon_code" text;
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "starts_at" timestamp;
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "min_order_amount" real DEFAULT 0 NOT NULL;
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "max_discount" real;
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "usage_limit" integer;
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "per_customer_limit" integer DEFAULT 1 NOT NULL;
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "usage_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;
ALTER TABLE "contact_messages" ADD COLUMN IF NOT EXISTS "read_at" timestamp;

CREATE TABLE IF NOT EXISTS "coupon_usages" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"coupon_id" uuid NOT NULL REFERENCES "coupons"("id") ON DELETE CASCADE,"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,"order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,"discount_amount" real NOT NULL,"created_at" timestamp DEFAULT now() NOT NULL);
CREATE TABLE IF NOT EXISTS "inventory_movements" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,"order_id" uuid REFERENCES "orders"("id") ON DELETE SET NULL,"actor_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,"quantity_change" integer NOT NULL,"reason" text NOT NULL,"created_at" timestamp DEFAULT now() NOT NULL);
CREATE TABLE IF NOT EXISTS "return_requests" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,"reason" text NOT NULL,"notes" text,"status" text DEFAULT 'pending' NOT NULL,"refund_status" text DEFAULT 'not_required' NOT NULL,"admin_note" text,"created_at" timestamp DEFAULT now() NOT NULL,"updated_at" timestamp DEFAULT now() NOT NULL);
CREATE TABLE IF NOT EXISTS "admin_notifications" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"type" text NOT NULL,"title" text NOT NULL,"message" text,"href" text NOT NULL,"entity_key" text UNIQUE,"read_at" timestamp,"created_at" timestamp DEFAULT now() NOT NULL);
