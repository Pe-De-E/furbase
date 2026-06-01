import { pgTable, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { user } from './user'
import { tier } from './tier'

export const favorit = pgTable('favorit', {
  userId:    uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  tierId:    uuid('tier_id').notNull().references(() => tier.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.tierId] })])
