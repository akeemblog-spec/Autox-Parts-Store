ALTER TYPE "order_status" ADD VALUE IF NOT EXISTS 'out_for_delivery';
ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "cover_image" text;
ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true NOT NULL;
ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "cover_image" text;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true NOT NULL;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL;

CREATE TABLE IF NOT EXISTS "vehicle_types" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "image" text,
  "active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "part_types" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "description" text,
  "active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "hero_slides" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "eyebrow" text,
  "headline" text NOT NULL,
  "headline_accent" text,
  "description" text,
  "image" text NOT NULL,
  "mobile_image" text,
  "primary_label" text DEFAULT 'Shop Parts' NOT NULL,
  "primary_href" text DEFAULT '/products' NOT NULL,
  "secondary_label" text,
  "secondary_href" text,
  "active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "site_settings" (
  "key" text PRIMARY KEY NOT NULL,
  "value" text NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "order_status_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE cascade,
  "status" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

INSERT INTO "vehicle_types" ("slug","name","sort_order") VALUES
('bike','Bike',0),('three-wheeler','Three Wheeler',1)
ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "part_types" ("slug","name","sort_order") VALUES
('genuine_honda','Genuine Honda',0),('genuine','Genuine',1),('oem','OEM',2),('aftermarket','Aftermarket',3)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "site_settings" ("key","value") VALUES
('hero_autoplay','true'),('hero_interval','5000'),('hero_pause_hover','true'),
('footer_copyright','AutoX Parts Store. All Rights Reserved.'),
('footer_bottom_text','Made with ♥ in Sri Lanka'),
('social_facebook',''),('social_instagram',''),('social_youtube',''),('social_tiktok',''),('social_whatsapp',''),('social_x','')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "hero_slides" ("headline","headline_accent","description","image","primary_label","primary_href","secondary_label","secondary_href","sort_order")
SELECT 'Genuine Parts.','Peak Performance.','High quality motorcycle and three wheeler parts for every ride. Built to perform. Built to last.','https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200&auto=format&fit=crop','Shop Parts','/products','Parts Finder','/parts-finder',0
WHERE NOT EXISTS (SELECT 1 FROM "hero_slides");

-- Backfill existing orders with the one timestamp we can truthfully know.
INSERT INTO "order_status_history" ("order_id","status","title","description","created_at")
SELECT o."id", 'pending', 'Order Placed', 'Thank you. Your order has been received.', o."created_at"
FROM "orders" o
WHERE NOT EXISTS (SELECT 1 FROM "order_status_history" h WHERE h."order_id" = o."id" AND h."status" = 'pending');

-- Make vehicle/part taxonomies truly admin-extensible while preserving all existing values.
ALTER TABLE "brands" ALTER COLUMN "vehicle_type" TYPE text USING "vehicle_type"::text;
ALTER TABLE "products" ALTER COLUMN "vehicle_type" TYPE text USING "vehicle_type"::text;
ALTER TABLE "products" ALTER COLUMN "part_type" TYPE text USING "part_type"::text;

CREATE TABLE IF NOT EXISTS "user_preferences" (
  "user_id" uuid PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "order_updates" boolean DEFAULT true NOT NULL,
  "promotions" boolean DEFAULT false NOT NULL,
  "product_news" boolean DEFAULT false NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
