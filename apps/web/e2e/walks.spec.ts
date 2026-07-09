import { test as fixturesTest, expect } from './fixtures'
import { encode } from 'next-auth/jwt'
import { type Page } from '@playwright/test'
import { Pool } from 'pg'

// fixtures.ts calls loadEnvConfig at module load, so AUTH_SECRET is available here.
const SECRET = process.env.AUTH_SECRET!
const SALT = 'authjs.session-token'

// Each parallel project gets its own volunteer user to avoid cross-project DB conflicts.
// These IDs are dedicated to this file — they must not match any ID used by other spec
// files (e.g. the userPage fixture's 000...001, or admin-volunteers.spec.ts's 000...003),
// since concurrent writes to the same volunteer_profile/user row across spec files running
// in parallel can cause DB lock contention and hang the whole suite.
const CHROMIUM_VOL_USER = '00000000-0000-0000-0000-000000000101'
const MOBILE_VOL_USER = '00000000-0000-0000-0000-000000000102'

// Dedicated non-volunteer — never gets a volunteer_profile
const TEST_NONVOL_ID = '00000000-0000-0000-0000-000000000099'

// Far-future weeks give each interactive test isolated DB state without setup races.
// Both projects share these constants but use different volunteer user IDs, so slots
// for the two projects never collide.
// Use different MONTHS so cleanup ranges never overlap (Jan for sign-up, Mar for cancel).
const SIGN_UP_TEST_WEEK = '2099-01-06' // used only by the sign-up test (Jan 2099)
const CANCEL_TEST_WEEK = '2099-03-10' // used only by the cancel test (Mar 2099)

async function sessionCookie(user: Record<string, unknown>) {
  const value = await encode({ token: user, secret: SECRET, salt: SALT })
  return { name: SALT, value, domain: 'localhost', path: '/' }
}

// Extend existing fixtures with a project-aware volunteer page and a non-volunteer page.
// volunteerPage selects a different user per project so chromium and mobile workers
// don't interfere with each other's walk_slot rows.
const test = fixturesTest.extend<
  { volunteerPage: Page; nonVolPage: Page },
  { projectVolUserId: string }
>({
  projectVolUserId: [
    async ({}, use, workerInfo) => {
      await use(
        workerInfo.project.name === 'mobile'
          ? MOBILE_VOL_USER
          : CHROMIUM_VOL_USER,
      )
    },
    { scope: 'worker' },
  ],

  volunteerPage: async ({ browser, projectVolUserId }, use) => {
    const ctx = await browser.newContext()
    await ctx.addCookies([
      await sessionCookie({
        id: projectVolUserId,
        role: 'user',
        name: 'Test User',
        email: `vol-${projectVolUserId}@test.com`,
      }),
    ])
    const page = await ctx.newPage()
    await use(page)
    await ctx.close()
  },

  nonVolPage: async ({ browser }, use) => {
    const ctx = await browser.newContext()
    await ctx.addCookies([
      await sessionCookie({
        id: TEST_NONVOL_ID,
        role: 'user',
        name: 'No Vol User',
        email: 'nonvol@test.com',
      }),
    ])
    const page = await ctx.newPage()
    await use(page)
    await ctx.close()
  },
})

let pool: Pool
let testAnimalId: string | null = null

test.beforeAll(async ({}, workerInfo) => {
  pool = new Pool({ connectionString: process.env.DATABASE_URL })

  const volUserId =
    workerInfo.project.name === 'mobile' ? MOBILE_VOL_USER : CHROMIUM_VOL_USER

  await pool.query(
    `INSERT INTO "user" (id, name, email) VALUES ($1, 'Test User', $2) ON CONFLICT DO NOTHING`,
    [volUserId, `vol-${volUserId}@test.com`],
  )
  await pool.query(
    `INSERT INTO "user" (id, name, email) VALUES ($1, 'No Vol User', 'nonvol@test.com') ON CONFLICT DO NOTHING`,
    [TEST_NONVOL_ID],
  )
  await pool.query(
    `INSERT INTO volunteer_profile (user_id, can_walk_dogs, can_foster, can_transport, can_help, approved)
     VALUES ($1, true, false, false, false, true)
     ON CONFLICT (user_id) DO UPDATE SET can_walk_dogs = true, approved = true`,
    [volUserId],
  )

  const { rows } = await pool.query(
    `SELECT id FROM animal ORDER BY name LIMIT 1`,
  )
  testAnimalId = rows[0]?.id ?? null
})

test.afterAll(async () => {
  // Do NOT delete walk_slots here: afterAll runs per-worker and an early-finishing
  // worker would delete slots that concurrent workers' tests are still using.
  // Each interactive test cleans its own week before running instead.
  await pool.end()
})

// --- Logged out ---

test.describe('Walks page (logged out)', () => {
  test('redirects to sign in', async ({ page }) => {
    await page.goto('/en/walks')
    await expect(page).toHaveURL(/signin|auth/)
  })
})

// --- Non-volunteer (separate user — immune to volunteer test races) ---

test.describe('Walks page (non-volunteer)', () => {
  test('shows not-a-volunteer message with profile link', async ({
    nonVolPage,
  }) => {
    await nonVolPage.goto('/en/walks')
    await expect(
      nonVolPage.getByText(/not registered as a volunteer/i),
    ).toBeVisible()
    await expect(
      nonVolPage.getByRole('link', { name: /go to profile/i }),
    ).toBeVisible()
  })

  test('profile link points to /profile', async ({ nonVolPage }) => {
    await nonVolPage.goto('/en/walks')
    await expect(
      nonVolPage.getByRole('link', { name: /go to profile/i }),
    ).toHaveAttribute('href', /\/profile/)
  })
})

// --- Volunteer ---
// Each interactive test navigates to a unique far-future week so its slots
// don't collide with other tests running in parallel (fullyParallel: true).

test.describe('Walks page (volunteer)', () => {
  test('shows the walk schedule heading', async ({ volunteerPage }) => {
    await volunteerPage.goto('/en/walks')
    await expect(
      volunteerPage.getByRole('heading', { name: /walk schedule/i }),
    ).toBeVisible()
  })

  test('shows + buttons for animals in the grid', async ({ volunteerPage }) => {
    if (!testAnimalId) test.skip()
    await volunteerPage.goto('/en/walks')
    await expect(
      volunteerPage.getByRole('button', { name: '+' }).first(),
    ).toBeVisible()
  })

  test('volunteer can sign up for a slot and see their name', async ({
    volunteerPage,
    projectVolUserId,
  }) => {
    if (!testAnimalId) test.skip()
    // Clean this test's week before starting (removes stale slots from previous runs
    // and doesn't touch the cancel test's different week — no cross-test interference)
    // Clean entire January 2099 (sign-up month) — no overlap with cancel's March 2099
    await pool.query(
      `DELETE FROM walk_slot WHERE user_id = $1 AND date >= '2099-01-01' AND date <= '2099-01-31'`,
      [projectVolUserId],
    )
    await volunteerPage.goto(`/en/walks?week=${SIGN_UP_TEST_WEEK}`)
    await volunteerPage.getByRole('button', { name: '+' }).first().click()
    // getByRole filters to visible elements, avoiding the hidden mobile-view duplicate
    await expect(
      volunteerPage.getByRole('button', { name: /cancel/i }).first(),
    ).toBeVisible({ timeout: 10000 })
  })

  test('volunteer can cancel a slot they signed up for', async ({
    volunteerPage,
    projectVolUserId,
  }) => {
    if (!testAnimalId) test.skip()
    // Clean entire March 2099 (cancel month) — no overlap with sign-up's January 2099
    await pool.query(
      `DELETE FROM walk_slot WHERE user_id = $1 AND date >= '2099-03-01' AND date <= '2099-03-31'`,
      [projectVolUserId],
    )
    await volunteerPage.goto(`/en/walks?week=${CANCEL_TEST_WEEK}`)

    await volunteerPage.getByRole('button', { name: '+' }).first().click()

    const cancelBtn = volunteerPage
      .getByRole('button', { name: /cancel/i })
      .first()
    await expect(cancelBtn).toBeVisible({ timeout: 10000 })

    await cancelBtn.click()
    await expect(
      volunteerPage.getByRole('button', { name: '+' }).first(),
    ).toBeVisible({ timeout: 10000 })
  })

  test('shows week navigation links (desktop only)', async (
    { volunteerPage },
    testInfo,
  ) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Week navigation is hidden on the mobile viewport',
    )
    await volunteerPage.goto('/en/walks')
    await expect(
      volunteerPage.getByRole('link', { name: /previous week/i }),
    ).toBeVisible()
    await expect(
      volunteerPage.getByRole('link', { name: /next week →/i }),
    ).toBeVisible()
  })
})

// --- Admin ---

test.describe('Walks page (admin)', () => {
  test('admin sees the schedule without a volunteer profile', async ({
    adminPage,
  }) => {
    await adminPage.goto('/en/walks')
    await expect(
      adminPage.getByRole('heading', { name: /walk schedule/i }),
    ).toBeVisible()
    await expect(
      adminPage.getByText(/not registered as a volunteer/i),
    ).not.toBeVisible()
  })
})
