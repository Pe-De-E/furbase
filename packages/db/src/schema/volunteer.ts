import { pgTable, uuid, boolean, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './user'

export const volunteerProfile = pgTable('volunteer_profile', {
  id:               uuid('id').primaryKey().defaultRandom(),
  userId:           uuid('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  canFoster:        boolean('can_foster').default(false),
  canTransport:     boolean('can_transport').default(false),
  canWalkDogs:      boolean('can_walk_dogs').default(false),
  canHelp:          boolean('can_help').default(false),
  notes:            text('notes'),
  grantedFoster:    boolean('granted_foster').default(false).notNull(),
  grantedTransport: boolean('granted_transport').default(false).notNull(),
  grantedWalkDogs:  boolean('granted_walk_dogs').default(false).notNull(),
  grantedHelp:      boolean('granted_help').default(false).notNull(),
  updatedAt:        timestamp('updated_at').defaultNow().notNull(),
})
