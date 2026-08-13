import { pgTable, pgEnum, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './user'

export const feedbackStatusEnum = pgEnum('feedback_status', ['new', 'resolved'])

export const feedback = pgTable('feedback', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  message:   text('message').notNull(),
  status:    feedbackStatusEnum('status').default('new').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
