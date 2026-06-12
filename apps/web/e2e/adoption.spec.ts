import { test, expect } from './fixtures'
import { Pool } from 'pg'

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'

let pool: Pool

test.beforeAll(async () => {
  pool = new Pool({ connectionString: process.env.DATABASE_URL })
  // the fixture user only exists in the JWT — progress rows need a real user row (FK)
  await pool.query(
    `INSERT INTO "user" (id, name, email) VALUES ($1, 'Test User', 'user@test.com')
     ON CONFLICT DO NOTHING`,
    [TEST_USER_ID],
  )
})

// no global data cleanup here: afterAll runs once per worker, and a worker
// finishing early would delete rows that tests in other workers still need.
// Each test cleans up exactly the rows it created instead.
test.afterAll(async () => {
  await pool.end()
})

test.describe('Adoption checklist (logged out)', () => {
  test('checklist is publicly visible', async ({ page }) => {
    await page.goto('/en/adoption')
    await expect(
      page.getByRole('heading', { name: 'Adoption Checklist' }),
    ).toBeVisible()
    expect(await page.getByRole('checkbox').count()).toBeGreaterThan(0)
  })

  test('shows login hint instead of progress bar', async ({ page }) => {
    await page.goto('/en/adoption')
    await expect(
      page.getByRole('button', { name: 'Sign in to save your progress' }),
    ).toBeVisible()
    await expect(page.getByText(/\d+ of \d+ completed/)).not.toBeVisible()
  })

  test('checking an item redirects to sign in', async ({ page }) => {
    await page.goto('/en/adoption')
    await page.getByRole('checkbox').first().click()
    await expect(page).toHaveURL(/google|signin|auth/, { timeout: 15000 })
  })
})

test.describe('Adoption checklist (logged in)', () => {
  test('shows progress bar instead of login hint', async ({ userPage }) => {
    await userPage.goto('/en/adoption')
    await expect(userPage.getByText(/\d+ of \d+ completed/)).toBeVisible()
    await expect(
      userPage.getByRole('button', { name: 'Sign in to save your progress' }),
    ).not.toBeVisible()
  })

  test('checked item persists across reload', async ({ userPage }, testInfo) => {
    // chromium and mobile run in parallel — use a different item per project
    const offset = testInfo.project.name === 'mobile' ? 1 : 0
    const { rows } = await pool.query(
      `SELECT id, text_en FROM adoption_checklist_item
       ORDER BY sort_order ASC LIMIT 1 OFFSET $1`,
      [offset],
    )
    const item = rows[0]
    await pool.query(
      `DELETE FROM adoption_checklist_progress WHERE user_id = $1 AND item_id = $2`,
      [TEST_USER_ID, item.id],
    )

    await userPage.goto('/en/adoption')
    const checkbox = userPage
      .locator('label', { hasText: item.text_en })
      .getByRole('checkbox')

    await expect(checkbox).not.toBeChecked()
    await checkbox.click()
    await expect(checkbox).toBeChecked()

    await userPage.reload()
    await expect(checkbox).toBeChecked()

    await checkbox.click()
    await expect(checkbox).not.toBeChecked()

    await userPage.reload()
    await expect(checkbox).not.toBeChecked()
  })
})

test.describe('Adoption checklist (admin)', () => {
  test('admin list shows checklist items', async ({ adminPage }) => {
    await adminPage.goto('/en/admin/adoption')
    await expect(
      adminPage.getByRole('heading', { name: 'Adoption Checklist' }),
    ).toBeVisible()
    expect(await adminPage.getByRole('row').count()).toBeGreaterThan(1)
  })

  test('admin can create and delete an item', async ({
    adminPage,
  }, testInfo) => {
    test.slow() // first hit on the form route can be slow on a cold dev server
    const unique = `E2E-Item ${testInfo.project.name} ${Date.now()}`

    await adminPage.goto('/en/admin/adoption/new')
    await expect(
      adminPage.getByRole('heading', { name: 'New item' }),
    ).toBeVisible({ timeout: 30000 })
    await adminPage.locator('input[name="textDe"]').fill(unique)
    await adminPage.locator('input[name="textEn"]').fill(`${unique} (en)`)
    await adminPage.locator('input[name="sortOrder"]').fill('999')
    await adminPage.getByRole('button', { name: 'Save' }).click()

    await expect(adminPage).toHaveURL(/\/admin\/adoption$/)

    await adminPage.goto('/en/admin/adoption')
    const row = adminPage.getByRole('row').filter({ hasText: unique })
    await expect(row).toBeVisible()

    adminPage.on('dialog', (dialog) => dialog.accept())
    await row.getByRole('button', { name: 'Delete' }).click()
    await expect(row).not.toBeVisible()
  })
})
