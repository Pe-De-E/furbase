import { test as base, expect, type Page } from '@playwright/test'
import { encode } from 'next-auth/jwt'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

const SECRET = process.env.AUTH_SECRET!
const SALT = 'authjs.session-token'

async function sessionCookie(user: Record<string, unknown>) {
  const value = await encode({ token: user, secret: SECRET, salt: SALT })
  return { name: SALT, value, domain: 'localhost', path: '/' }
}

type Fixtures = {
  userPage: Page
  adminPage: Page
}

export const test = base.extend<Fixtures>({
  userPage: async ({ browser }, use) => {
    const context = await browser.newContext()
    await context.addCookies([
      await sessionCookie({
        id: '00000000-0000-0000-0000-000000000001',
        role: 'user',
        name: 'Test User',
        email: 'user@test.com',
      }),
    ])
    const page = await context.newPage()
    await use(page)
    await context.close()
  },

  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext()
    await context.addCookies([
      await sessionCookie({
        id: '00000000-0000-0000-0000-000000000002',
        role: 'admin',
        name: 'Test Admin',
        email: process.env.ADMIN_EMAILS?.split(',')[0] ?? 'admin@test.com',
      }),
    ])
    const page = await context.newPage()
    await use(page)
    await context.close()
  },
})

export { expect }
