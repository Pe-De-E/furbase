import { test, expect } from './fixtures'
import { Pool } from 'pg'

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'
const TEST_ANIMAL_ID = '00000000-0000-0000-0000-000000000099'

let pool: Pool

test.beforeAll(async () => {
  pool = new Pool({ connectionString: process.env.DATABASE_URL })

  await pool.query(
    `INSERT INTO "user" (id, name, email) VALUES ($1, 'Test User', 'user@test.com')
     ON CONFLICT DO NOTHING`,
    [TEST_USER_ID],
  )

  await pool.query(
    `INSERT INTO animal (id, name, species, status)
     VALUES ($1, 'Testbello', 'dog', 'available')
     ON CONFLICT (id) DO UPDATE SET status = 'available'`,
    [TEST_ANIMAL_ID],
  )
})

test.afterAll(async () => {
  await pool.query(`DELETE FROM adoption_request WHERE animal_id = $1`, [
    TEST_ANIMAL_ID,
  ])
  await pool.query(`DELETE FROM animal WHERE id = $1`, [TEST_ANIMAL_ID])
  await pool.end()
})

test.describe('Adoption request — logged out', () => {
  test('shows sign-in link on available animal', async ({ page }) => {
    await page.goto(`/en/animals/${TEST_ANIMAL_ID}`)
    await expect(
      page.getByRole('link', { name: /sign in to request adoption/i }),
    ).toBeVisible()
  })
})

test.describe('Adoption request — logged in', () => {
  test.beforeEach(async () => {
    await pool.query(
      `DELETE FROM adoption_request WHERE user_id = $1 AND animal_id = $2`,
      [TEST_USER_ID, TEST_ANIMAL_ID],
    )
  })

  test('shows request button on available animal', async ({ userPage }) => {
    await userPage.goto(`/en/animals/${TEST_ANIMAL_ID}`)
    await expect(
      userPage.getByRole('button', { name: /request adoption/i }),
    ).toBeVisible()
  })

  test('can cancel the request form', async ({ userPage }) => {
    await userPage.goto(`/en/animals/${TEST_ANIMAL_ID}`)
    await userPage.getByRole('button', { name: /request adoption/i }).click()
    await expect(userPage.getByPlaceholder(/tell us a bit/i)).toBeVisible()
    await userPage.getByRole('button', { name: /cancel/i }).click()
    await expect(userPage.getByPlaceholder(/tell us a bit/i)).not.toBeVisible()
  })

  test('submitting shows success state', async ({ userPage }) => {
    await userPage.goto(`/en/animals/${TEST_ANIMAL_ID}`)
    await userPage.getByRole('button', { name: /request adoption/i }).click()
    await userPage.getByRole('button', { name: /submit request/i }).click()
    await expect(
      userPage.getByText(/adoption request submitted/i),
    ).toBeVisible()
  })

  test('existing request shows success state on reload', async ({
    userPage,
  }) => {
    await pool.query(
      `INSERT INTO adoption_request (user_id, animal_id, status)
       VALUES ($1, $2, 'pending')`,
      [TEST_USER_ID, TEST_ANIMAL_ID],
    )
    await userPage.goto(`/en/animals/${TEST_ANIMAL_ID}`)
    await expect(
      userPage.getByText(/adoption request submitted/i),
    ).toBeVisible()
  })

  test('request appears on profile with pending status', async ({
    userPage,
  }) => {
    await pool.query(
      `INSERT INTO adoption_request (user_id, animal_id, status)
       VALUES ($1, $2, 'pending')`,
      [TEST_USER_ID, TEST_ANIMAL_ID],
    )
    await userPage.goto('/en/profile')
    await expect(
      userPage.getByRole('heading', { name: /my adoption requests/i }),
    ).toBeVisible()
    await expect(userPage.getByText('Testbello')).toBeVisible()
    await expect(userPage.getByText(/pending/i).first()).toBeVisible()
  })
})

test.describe('Adoption request — admin', () => {
  test('admin requests page is accessible', async ({ adminPage }) => {
    await adminPage.goto('/en/admin/requests')
    await expect(
      adminPage.getByRole('heading', { name: 'Adoption Requests' }),
    ).toBeVisible()
  })

  test('admin can approve a pending request', async ({ adminPage }) => {
    await pool.query(
      `DELETE FROM adoption_request WHERE user_id = $1 AND animal_id = $2`,
      [TEST_USER_ID, TEST_ANIMAL_ID],
    )
    await pool.query(
      `INSERT INTO adoption_request (user_id, animal_id, status)
       VALUES ($1, $2, 'pending')`,
      [TEST_USER_ID, TEST_ANIMAL_ID],
    )

    await adminPage.goto('/en/admin/requests')
    const card = adminPage.locator('div.bg-white', { hasText: 'Testbello' }).first()
    await card.getByRole('button', { name: /approve/i }).click()
    await expect(card.getByRole('button', { name: /approve/i })).not.toBeVisible()
    await expect(card.getByText(/approved/i)).toBeVisible()
  })

  test('admin can reject a pending request', async ({ adminPage }) => {
    await pool.query(
      `DELETE FROM adoption_request WHERE user_id = $1 AND animal_id = $2`,
      [TEST_USER_ID, TEST_ANIMAL_ID],
    )
    await pool.query(
      `INSERT INTO adoption_request (user_id, animal_id, status)
       VALUES ($1, $2, 'pending')`,
      [TEST_USER_ID, TEST_ANIMAL_ID],
    )

    await adminPage.goto('/en/admin/requests')
    const card = adminPage.locator('div.bg-white', { hasText: 'Testbello' }).first()
    await card.getByRole('button', { name: /reject/i }).click()
    await expect(card.getByRole('button', { name: /reject/i })).not.toBeVisible()
    await expect(card.getByText(/rejected/i)).toBeVisible()
  })
})
