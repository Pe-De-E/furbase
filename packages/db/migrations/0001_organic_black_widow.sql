CREATE TABLE "adoption_checklist_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adoption_checklist_progress" (
	"user_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"checked_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "adoption_checklist_progress_user_id_item_id_pk" PRIMARY KEY("user_id","item_id")
);
--> statement-breakpoint
ALTER TABLE "adoption_checklist_progress" ADD CONSTRAINT "adoption_checklist_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_checklist_progress" ADD CONSTRAINT "adoption_checklist_progress_item_id_adoption_checklist_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."adoption_checklist_item"("id") ON DELETE cascade ON UPDATE no action;