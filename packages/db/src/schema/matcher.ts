import {
  pgTable,
  pgEnum,
  uuid,
  boolean,
  integer,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { user } from './user'

export const livingSituationEnum = pgEnum('living_situation', [
  'wohnung', 'haus_mit_garten',
])

export const experienceLevelEnum = pgEnum('experience_level', [
  'anfaenger', 'erfahren',
])

export const preferredSizeEnum = pgEnum('preferred_size', [
  'klein', 'mittel', 'gross', 'egal',
])

export const matcherProfil = pgTable('matcher_profil', {
  id:                uuid('id').primaryKey().defaultRandom(),
  userId:            uuid('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  livingSituation:   livingSituationEnum('living_situation'),
  hasKids:           boolean('has_kids'),
  hasOtherDogs:      boolean('has_other_dogs'),
  hasOtherCats:      boolean('has_other_cats'),
  activityLevel:     text('activity_level'),
  hoursAlonePerDay:  integer('hours_alone_per_day'),
  experienceLevel:   experienceLevelEnum('experience_level'),
  preferredSpecies:  text('preferred_species').array(),
  preferredSize:     preferredSizeEnum('preferred_size'),
  allergies:         boolean('allergies').default(false),
  updatedAt:         timestamp('updated_at').defaultNow().notNull(),
})
