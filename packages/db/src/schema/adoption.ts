import { pgTable, pgEnum, uuid, text, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { user } from './user'
import { animal } from './animal'

export const adoptionChecklistItem = pgTable('adoption_checklist_item', {
  id:             uuid('id').primaryKey().defaultRandom(),
  textDe:         text('text_de').notNull(),
  textEn:         text('text_en').notNull(),
  descriptionDe:  text('description_de'),
  descriptionEn:  text('description_en'),
  sortOrder:      integer('sort_order').notNull().default(0),
})

export const adoptionRequestStatusEnum = pgEnum('adoption_request_status', [
  'pending', 'approved', 'rejected',
])

export const adoptionRequest = pgTable('adoption_request', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  animalId:  uuid('animal_id').notNull().references(() => animal.id, { onDelete: 'cascade' }),
  status:    adoptionRequestStatusEnum('status').default('pending').notNull(),
  message:   text('message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const adoptionChecklistProgress = pgTable(
  'adoption_checklist_progress',
  {
    userId:    uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    itemId:    uuid('item_id').notNull().references(() => adoptionChecklistItem.id, { onDelete: 'cascade' }),
    checkedAt: timestamp('checked_at').defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.itemId] })],
)
