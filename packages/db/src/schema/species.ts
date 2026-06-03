import { pgTable, uuid, text, integer } from 'drizzle-orm/pg-core'

export const species = pgTable('species', {
  id:        uuid('id').primaryKey().defaultRandom(),
  value:     text('value').notNull().unique(), // e.g. 'dog'
  label:     text('label').notNull(),           // e.g. 'Dogs'
  sortOrder: integer('sort_order').default(0).notNull(),
})
