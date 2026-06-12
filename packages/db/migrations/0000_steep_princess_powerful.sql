CREATE TYPE "public"."activity_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."animal_status" AS ENUM('available', 'reserved', 'adopted', 'quarantine', 'not_adoptable');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."size" AS ENUM('small', 'medium', 'large');--> statement-breakpoint
CREATE TYPE "public"."tag_category" AS ENUM('health', 'behavior', 'needs');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('beginner', 'experienced');--> statement-breakpoint
CREATE TYPE "public"."living_situation" AS ENUM('apartment', 'house_with_garden');--> statement-breakpoint
CREATE TYPE "public"."preferred_size" AS ENUM('small', 'medium', 'large', 'any');--> statement-breakpoint
CREATE TABLE "animal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"species" text NOT NULL,
	"breed" text,
	"breed_suspected" text,
	"age" integer,
	"gender" "gender",
	"size" "size",
	"weight" numeric(5, 2),
	"color" text,
	"description" text,
	"images" text[],
	"status" "animal_status" DEFAULT 'available' NOT NULL,
	"arrival_date" date,
	"is_neutered" boolean DEFAULT false,
	"is_vaccinated" boolean DEFAULT false,
	"is_chipped" boolean DEFAULT false,
	"good_with_kids" boolean,
	"good_with_dogs" boolean,
	"good_with_cats" boolean,
	"activity_level" "activity_level",
	"needs_garden" boolean DEFAULT false,
	"needs_experienced_owner" boolean DEFAULT false,
	"needs_training" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "animal_tag" (
	"animal_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "animal_tag_animal_id_tag_id_pk" PRIMARY KEY("animal_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" "tag_category" NOT NULL,
	CONSTRAINT "tag_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "favorite" (
	"user_id" uuid NOT NULL,
	"animal_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_user_id_animal_id_pk" PRIMARY KEY("user_id","animal_id")
);
--> statement-breakpoint
CREATE TABLE "species" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "species_value_unique" UNIQUE("value")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_token" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "matcher_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"living_situation" "living_situation",
	"has_kids" boolean,
	"has_other_dogs" boolean,
	"has_other_cats" boolean,
	"activity_level" text,
	"hours_alone_per_day" integer,
	"experience_level" "experience_level",
	"preferred_species" text[],
	"preferred_size" "preferred_size",
	"allergies" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "matcher_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"phone" text,
	"email" text,
	"website" text,
	"description" text,
	"logo" text
);
--> statement-breakpoint
CREATE TABLE "volunteer_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"can_foster" boolean DEFAULT false,
	"can_transport" boolean DEFAULT false,
	"can_walk_dogs" boolean DEFAULT false,
	"can_help" boolean DEFAULT false,
	"notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "volunteer_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "animal_tag" ADD CONSTRAINT "animal_tag_animal_id_animal_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_tag" ADD CONSTRAINT "animal_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_animal_id_animal_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matcher_profile" ADD CONSTRAINT "matcher_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_profile" ADD CONSTRAINT "volunteer_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;