import { test, expect } from './fixtures'
import { Pool } from 'pg'

const TEST_USER_ID = '00000000-0000-0000-0000-000000000003'

let pool: Pool

test.beforeAll(async () => {
  pool = new Pool({ connectionString: process.env.DATABASE_URL })
  await pool.query(
    `INSERT INTO "user" (id, name, email) VALUES ($1, 'Volunteer User', 'volunteer@test.com')
     ON CONFLICT DO NOTHING`,
    [TEST_USER_ID],
  )
})

test.afterAll(async () => {
  await pool.end()
})

test.describe('Admin volunteers', () => {
  test('page loads with heading', async ({ adminPage }) => {
    await adminPage.goto('/en/admin/volunteers')
    await expect(
      adminPage.getByRole('heading', { name: 'Volunteers' }),
    ).toBeVisible()
  })

  test('volunteer registered via profile appears in admin list', async ({
    adminPage,
  }) => {
    await pool.query(
      `INSERT INTO volunteer_profile (user_id, can_foster, can_transport, can_walk_dogs, can_help)
       VALUES ($1, true, false, false, false)
       ON CONFLICT (user_id) DO UPDATE SET can_foster = true`,
      [TEST_USER_ID],
    )

    await adminPage.goto('/en/admin/volunteers')
    await expect(adminPage.getByText('volunteer@test.com')).toBeVisible()
    await expect(adminPage.getByText('Foster care')).toBeVisible()

    // cleanup
    await pool.query(`DELETE FROM volunteer_profile WHERE user_id = $1`, [
      TEST_USER_ID,
    ])
  })
})
