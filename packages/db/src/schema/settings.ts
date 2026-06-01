import { pgTable, uuid, text } from 'drizzle-orm/pg-core'

export const settings = pgTable('settings', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        text('name').notNull(),
  address:     text('address'),
  phone:       text('phone'),
  email:       text('email'),
  website:     text('website'),
  description: text('description'),
  logo:        text('logo'),
})
