import { pgTable, pgEnum, uuid, text, boolean, date, timestamp, unique } from 'drizzle-orm/pg-core'
import { user } from './user'

export const gassigeherKategorieEnum = pgEnum('gassigeher_kategorie', [
  'gruen', 'gelb', 'rot',
])

export const gassigeherCheckStepEnum = pgEnum('gassigeher_check_step_type', [
  'kennenlernen', 'regeln', 'spaziergang_1', 'spaziergang_2', 'spaziergang_3',
  'schulung', 'social_walk', 'weiteres',
])

export const gassigeherFile = pgTable('gassigeher_file', {
  id:                      uuid('id').primaryKey().defaultRandom(),
  userId:                  uuid('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  contractImageUrl:        text('contract_image_url'),
  hundeerfahrung:          text('hundeerfahrung'),
  welcheHunde:             text('welche_hunde'),
  ausbildung:              text('ausbildung'),
  eigeneinschaetzung:      text('eigeneinschaetzung'),
  kategorie:               gassigeherKategorieEnum('kategorie'),
  aufnahme:                boolean('aufnahme').default(false).notNull(),
  aufnahmeDatum:           date('aufnahme_datum'),
  datum:                   date('datum'),
  unterschriftMitarbeiter: text('unterschrift_mitarbeiter'),
  createdAt:               timestamp('created_at').defaultNow().notNull(),
  updatedAt:               timestamp('updated_at').defaultNow().notNull(),
})

export const gassigeherCheckStep = pgTable('gassigeher_check_step', {
  id:               uuid('id').primaryKey().defaultRandom(),
  gassigeherFileId: uuid('gassigeher_file_id').notNull().references(() => gassigeherFile.id, { onDelete: 'cascade' }),
  step:             gassigeherCheckStepEnum('step').notNull(),
  label:            text('label'), // only used for the 'weiteres' row
  datum:            date('datum'),
  einschaetzung:    text('einschaetzung'),
  mitarbeiter:      text('mitarbeiter'),
}, (t) => [unique().on(t.gassigeherFileId, t.step)])
