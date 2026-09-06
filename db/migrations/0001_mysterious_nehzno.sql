ALTER TYPE "public"."payment_method" ADD VALUE 'koko';--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE 'mintpay';--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"method" "payment_method" NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"enabled" boolean DEFAULT false NOT NULL,
	"config" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_methods_method_unique" UNIQUE("method")
);
