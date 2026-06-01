import { pgTable, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { user } from './user'
import { animal } from './animal'

export const favorite = pgTable('favorite', {
  userId:    uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  animalId:  uuid('animal_id').notNull().references(() => animal.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.animalId] })])
