-- Truncate existing seed data, then restructure adoption_checklist_item for i18n
TRUNCATE TABLE "adoption_checklist_progress";
TRUNCATE TABLE "adoption_checklist_item";

ALTER TABLE "adoption_checklist_item"
  RENAME COLUMN "text" TO "text_de";

ALTER TABLE "adoption_checklist_item"
  RENAME COLUMN "description" TO "description_de";

ALTER TABLE "adoption_checklist_item"
  ADD COLUMN "text_en" text NOT NULL DEFAULT '',
  ADD COLUMN "description_en" text;

ALTER TABLE "adoption_checklist_item"
  ALTER COLUMN "text_en" DROP DEFAULT;
