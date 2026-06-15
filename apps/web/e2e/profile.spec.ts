import { test, expect } from './fixtures'
import { Pool } from 'pg'

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'

let pool: Pool

test.beforeAll(async () => {
  pool = new Pool({ connectionString: process.env.DATABASE_URL })
  await pool.query(
    `INSERT INTO "user" (id, name, email) VALUES ($1, 'Test User', 'user@test.com')
     ON CONFLICT DO NOTHING`,
    [TEST_USER_ID],
  )
})

test.afterAll(async () => {
  await pool.end()
})

// ─── Volunteer form ───────────────────────────────────────────────────────────

test.describe('Profile — volunteer form', () => {
  test.beforeEach(async () => {
    await pool.query(`DELETE FROM volunteer_profile WHERE user_id = $1`, [
      TEST_USER_ID,
    ])
  })

  test.afterEach(async () => {
    await pool.query(`DELETE FROM volunteer_profile WHERE user_id = $1`, [
      TEST_USER_ID,
    ])
  })

  test('checking foster care and saving persists across reload', async ({
    userPage,
  }) => {
    await userPage.goto('/en/profile')

    const checkbox = userPage.locator('input[name="canFoster"]')
    await expect(checkbox).not.toBeChecked()
    await checkbox.check()
    await userPage.getByRole('button', { name: 'Save' }).click()

    // wait for the action to complete
    await expect(userPage.getByRole('button', { name: 'Save' })).toBeEnabled()

    await userPage.reload()
    await expect(userPage.locator('input[name="canFoster"]')).toBeChecked()
  })

  test('unchecking an option and saving persists across reload', async ({
    userPage,
  }) => {
    await pool.query(
      `INSERT INTO volunteer_profile (user_id, can_foster, can_transport, can_walk_dogs, can_help)
       VALUES ($1, true, false, false, false)`,
      [TEST_USER_ID],
    )

    await userPage.goto('/en/profile')
    await expect(userPage.locator('input[name="canFoster"]')).toBeChecked()

    await userPage.locator('input[name="canFoster"]').uncheck()
    await userPage.getByRole('button', { name: 'Save' }).click()
    await expect(userPage.getByRole('button', { name: 'Save' })).toBeEnabled()

    await userPage.reload()
    await expect(userPage.locator('input[name="canFoster"]')).not.toBeChecked()
  })
})

// ─── Favorites ────────────────────────────────────────────────────────────────

test.describe('Profile — favorites', () => {
  let animalId: string
  let animalName: string

  test.beforeEach(async ({}, testInfo) => {
    animalName = `E2E-Fav ${testInfo.project.name} ${Date.now()}`
    const { rows } = await pool.query(
      `INSERT INTO animal (name, species, status)
       VALUES ($1, 'dog', 'available') RETURNING id`,
      [animalName],
    )
    animalId = rows[0].id
    await pool.query(
      `DELETE FROM favorite WHERE user_id = $1 AND animal_id = $2`,
      [TEST_USER_ID, animalId],
    )
  })

  test.afterEach(async () => {
    await pool.query(
      `DELETE FROM favorite WHERE user_id = $1 AND animal_id = $2`,
      [TEST_USER_ID, animalId],
    )
    await pool.query(`DELETE FROM animal WHERE id = $1`, [animalId])
  })

  test('favoriting an animal shows it on the profile page', async ({
    userPage,
  }) => {
    await userPage.goto(`/en/animals/${animalId}`)

    // heart button is in the listing; navigate there to click it
    await userPage.goto('/en')
    const card = userPage.locator(`a[href="/en/animals/${animalId}"]`)

    // scroll into view in case it's below fold
    await card.scrollIntoViewIfNeeded()
    const heartBtn = card.locator('button[title]')
    await heartBtn.click()

    await userPage.goto('/en/profile')
    await expect(userPage.getByText(animalName)).toBeVisible()
  })

  test('unfavoriting removes animal from profile', async ({ userPage }) => {
    await pool.query(
      `INSERT INTO favorite (user_id, animal_id) VALUES ($1, $2)`,
      [TEST_USER_ID, animalId],
    )

    await userPage.goto('/en/profile')
    await expect(userPage.getByText(animalName)).toBeVisible()

    // unfavorite via the listing page
    await userPage.goto('/en')
    const card = userPage.locator(`a[href="/en/animals/${animalId}"]`)
    await card.scrollIntoViewIfNeeded()
    await card.locator('button[title]').click()

    await userPage.goto('/en/profile')
    await expect(userPage.getByText(animalName)).not.toBeVisible()
  })
})

// ─── Matcher profile ──────────────────────────────────────────────────────────

test.describe('Profile — matcher profile', () => {
  test.afterEach(async () => {
    await pool.query(`DELETE FROM matcher_profile WHERE user_id = $1`, [
      TEST_USER_ID,
    ])
  })

  test('completing the wizard saves matcher profile on profile page', async ({
    userPage,
  }) => {
    test.slow()

    await userPage.goto('/en/matcher')

    // Step 1: living situation
    await userPage.getByText('House with garden').click()
    await userPage.getByRole('button', { name: /continue/i }).click()

    // Step 2: household (optional)
    await userPage.getByRole('button', { name: /continue/i }).click()

    // Step 3: activity
    await userPage.getByText('Medium').first().click()
    await userPage.getByRole('button', { name: /continue/i }).click()

    // Step 4: hours alone
    await userPage.getByText('2-4 hours').click()
    await userPage.getByRole('button', { name: /continue/i }).click()

    // Step 5: experience
    await userPage.getByText('Experienced').click()
    await userPage.getByRole('button', { name: /continue/i }).click()

    // Step 6: submit
    await userPage.getByRole('button', { name: /find my match/i }).click()
    await expect(userPage).toHaveURL(/\/matcher\/results/)

    await userPage.goto('/en/profile')
    await expect(
      userPage.getByRole('heading', { name: /matching profile/i }),
    ).toBeVisible()
    await expect(userPage.getByText(/house with garden/i)).toBeVisible()
  })
})
