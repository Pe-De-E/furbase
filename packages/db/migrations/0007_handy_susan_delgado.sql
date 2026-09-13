CREATE TYPE "public"."gassigeher_check_step_type" AS ENUM('kennenlernen', 'regeln', 'spaziergang_1', 'spaziergang_2', 'spaziergang_3', 'schulung', 'social_walk', 'weiteres');--> statement-breakpoint
CREATE TYPE "public"."gassigeher_kategorie" AS ENUM('gruen', 'gelb', 'rot');--> statement-breakpoint
CREATE TABLE "gassigeher_check_step" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gassigeher_file_id" uuid NOT NULL,
	"step" "gassigeher_check_step_type" NOT NULL,
	"label" text,
	"datum" date,
	"einschaetzung" text,
	"mitarbeiter" text,
	CONSTRAINT "gassigeher_check_step_gassigeher_file_id_step_unique" UNIQUE("gassigeher_file_id","step")
);
--> statement-breakpoint
CREATE TABLE "gassigeher_file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"contract_image_url" text,
	"hundeerfahrung" text,
	"welche_hunde" text,
	"ausbildung" text,
	"eigeneinschaetzung" text,
	"kategorie" "gassigeher_kategorie",
	"aufnahme" boolean DEFAULT false NOT NULL,
	"aufnahme_datum" date,
	"datum" date,
	"unterschrift_mitarbeiter" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gassigeher_file_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "volunteer_profile" ADD COLUMN "granted_foster" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "volunteer_profile" ADD COLUMN "granted_transport" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "volunteer_profile" ADD COLUMN "granted_walk_dogs" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "volunteer_profile" ADD COLUMN "granted_help" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "volunteer_profile" SET
	"granted_foster" = "approved" AND COALESCE("can_foster", false),
	"granted_transport" = "approved" AND COALESCE("can_transport", false),
	"granted_walk_dogs" = "approved" AND COALESCE("can_walk_dogs", false),
	"granted_help" = "approved" AND COALESCE("can_help", false);--> statement-breakpoint
ALTER TABLE "gassigeher_check_step" ADD CONSTRAINT "gassigeher_check_step_gassigeher_file_id_gassigeher_file_id_fk" FOREIGN KEY ("gassigeher_file_id") REFERENCES "public"."gassigeher_file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gassigeher_file" ADD CONSTRAINT "gassigeher_file_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;