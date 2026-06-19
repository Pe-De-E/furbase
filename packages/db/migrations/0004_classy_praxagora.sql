CREATE TYPE "public"."walk_period" AS ENUM('morning', 'afternoon');--> statement-breakpoint
CREATE TABLE "walk_slot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"period" "walk_period" NOT NULL,
	"user_id" uuid NOT NULL,
	"animal_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "walk_slot_user_id_date_period_animal_id_unique" UNIQUE("user_id","date","period","animal_id")
);
--> statement-breakpoint
ALTER TABLE "walk_slot" ADD CONSTRAINT "walk_slot_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walk_slot" ADD CONSTRAINT "walk_slot_animal_id_animal_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animal"("id") ON DELETE cascade ON UPDATE no action;