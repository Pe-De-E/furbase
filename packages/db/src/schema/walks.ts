import {
  pgTable,
  pgEnum,
  uuid,
  date,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./user";
import { animal } from "./animal";

export const walkPeriodEnum = pgEnum("walk_period", ["morning", "afternoon"]);

export const walkSlot = pgTable(
  "walk_slot",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date").notNull(),
    period: walkPeriodEnum("period").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    animalId: uuid("animal_id")
      .notNull()
      .references(() => animal.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.date, t.period, t.animalId)],
);
