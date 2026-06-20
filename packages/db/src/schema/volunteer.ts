import { pgTable, uuid, boolean, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './user'

export const volunteerProfile = pgTable('volunteer_profile', {
  id:           uuid('id').primaryKey().defaultRandom(),
  userId:       uuid('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  canFoster:    boolean('can_foster').default(false),
  canTransport: boolean('can_transport').default(false),
  canWalkDogs:  boolean('can_walk_dogs').default(false),
  canHelp:      boolean('can_help').default(false),
  notes:        text('notes'),
  approved:     boolean('approved').default(false).notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
})
