import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  integer,
  primaryKey,
} from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['user', 'admin'])

export const user = pgTable('user', {
  id:            uuid('id').primaryKey().defaultRandom(),
  name:          text('name'),
  email:         text('email').notNull().unique(),
  emailVerified: timestamp('email_verified'),
  image:         text('image'),
  role:          userRoleEnum('role').default('user').notNull(),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
})

export const account = pgTable('account', {
  userId:            uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  type:              text('type').notNull(),
  provider:          text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refreshToken:      text('refresh_token'),
  accessToken:       text('access_token'),
  expiresAt:         integer('expires_at'),
  tokenType:         text('token_type'),
  scope:             text('scope'),
  idToken:           text('id_token'),
  sessionState:      text('session_state'),
}, (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })])

export const session = pgTable('session', {
  sessionToken: text('session_token').primaryKey(),
  userId:       uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  expires:      timestamp('expires').notNull(),
})

export const verificationToken = pgTable('verification_token', {
  identifier: text('identifier').notNull(),
  token:      text('token').notNull(),
  expires:    timestamp('expires').notNull(),
}, (t) => [primaryKey({ columns: [t.identifier, t.token] })])
