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
  'dog', 'cat', 'rabbit', 'bird', 'small_animal', 'other',
])

export const genderEnum = pgEnum('gender', [
  'male', 'female', 'unknown',
])

export const sizeEnum = pgEnum('size', [
  'small', 'medium', 'large',
])

export const animalStatusEnum = pgEnum('animal_status', [
  'available', 'reserved', 'adopted', 'quarantine', 'not_adoptable',
])

export const activityLevelEnum = pgEnum('activity_level', [
  'low', 'medium', 'high',
])

export const tagCategoryEnum = pgEnum('tag_category', [
  'health', 'behavior', 'needs',
])

export const animal = pgTable('animal', {
  id:                    uuid('id').primaryKey().defaultRandom(),
  name:                  text('name').notNull(),
  species:               speciesEnum('species').notNull(),
  breed:                 text('breed'),
  breedSuspected:        text('breed_suspected'),
  age:                   integer('age'), // in months
  gender:                genderEnum('gender'),
  size:                  sizeEnum('size'),
  weight:                numeric('weight', { precision: 5, scale: 2 }),
  color:                 text('color'),
  description:           text('description'),
  images:                text('images').array(),
  status:                animalStatusEnum('status').default('available').notNull(),
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

export const animalTag = pgTable('animal_tag', {
  animalId: uuid('animal_id').notNull().references(() => animal.id, { onDelete: 'cascade' }),
  tagId:    uuid('tag_id').notNull().references(() => tag.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.animalId, t.tagId] })])
