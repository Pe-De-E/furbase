import { pgTable, uuid, text, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { user } from './user'

export const adoptionChecklistItem = pgTable('adoption_checklist_item', {
  id:             uuid('id').primaryKey().defaultRandom(),
  textDe:         text('text_de').notNull(),
  textEn:         text('text_en').notNull(),
  descriptionDe:  text('description_de'),
  descriptionEn:  text('description_en'),
  sortOrder:      integer('sort_order').notNull().default(0),
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
