import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  date,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core'

export const speciesEnum = pgEnum('species', [
  'hund', 'katze', 'hase', 'vogel', 'kleintier', 'sonstige',
])

export const genderEnum = pgEnum('gender', [
  'maennlich', 'weiblich', 'unbekannt',
])

export const sizeEnum = pgEnum('size', [
  'klein', 'mittel', 'gross',
])

export const tierStatusEnum = pgEnum('tier_status', [
  'verfuegbar', 'reserviert', 'vermittelt', 'quarantaene', 'nicht_vermittelbar',
])

export const activityLevelEnum = pgEnum('activity_level', [
  'niedrig', 'mittel', 'hoch',
])

export const tagCategoryEnum = pgEnum('tag_category', [
  'health', 'behavior', 'needs',
])

export const tier = pgTable('tier', {
  id:                    uuid('id').primaryKey().defaultRandom(),
  name:                  text('name').notNull(),
  species:               speciesEnum('species').notNull(),
  breed:                 text('breed'),
  breedSuspected:        text('breed_suspected'),
  age:                   integer('age'), // in Monaten
  gender:                genderEnum('gender'),
  size:                  sizeEnum('size'),
  weight:                numeric('weight', { precision: 5, scale: 2 }),
  color:                 text('color'),
  description:           text('description'),
  images:                text('images').array(),
  status:                tierStatusEnum('status').default('verfuegbar').notNull(),
  arrivalDate:           date('arrival_date'),
  isNeutered:            boolean('is_neutered').default(false),
  isVaccinated:          boolean('is_vaccinated').default(false),
  isChipped:             boolean('is_chipped').default(false),
  goodWithKids:          boolean('good_with_kids'),
  goodWithDogs:          boolean('good_with_dogs'),
  goodWithCats:          boolean('good_with_cats'),
  activityLevel:         activityLevelEnum('activity_level'),
  needsGarden:           boolean('needs_garden').default(false),
  needsExperiencedOwner: boolean('needs_experienced_owner').default(false),
  needsTraining:         boolean('needs_training').default(false),
  createdAt:             timestamp('created_at').defaultNow().notNull(),
  updatedAt:             timestamp('updated_at').defaultNow().notNull(),
})

export const tag = pgTable('tag', {
  id:       uuid('id').primaryKey().defaultRandom(),
  name:     text('name').notNull().unique(),
  category: tagCategoryEnum('category').notNull(),
})

export const tierTag = pgTable('tier_tag', {
  tierId: uuid('tier_id').notNull().references(() => tier.id, { onDelete: 'cascade' }),
  tagId:  uuid('tag_id').notNull().references(() => tag.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.tierId, t.tagId] })])
