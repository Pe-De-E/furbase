import { test, expect } from './fixtures'
import { Pool } from 'pg'

let pool: Pool

test.beforeAll(async () => {
  pool = new Pool({ connectionString: process.env.DATABASE_URL })
})

test.afterAll(async () => {
  await pool.end()
})

test.describe('Admin species', () => {
  test('shows the species list and add form', async ({ adminPage }) => {
    await adminPage.goto('/en/admin/species')
    await expect(
      adminPage.getByRole('heading', { name: 'Species' }),
    ).toBeVisible()
    await expect(adminPage.getByText('Current species')).toBeVisible()
    await expect(adminPage.getByRole('button', { name: 'Add species' })).toBeVisible()
  })

  test('can add a species and it appears in the list', async ({
    adminPage,
  }, testInfo) => {
    test.slow()
    const label = `E2E Species ${testInfo.project.name} ${Date.now()}`
    const value = `e2e_species_${Date.now()}`

    await adminPage.goto('/en/admin/species')
    await adminPage.locator('input[name="label"]').fill(label)
    await adminPage.locator('input[name="value"]').fill(value)
    await adminPage.getByRole('button', { name: 'Add species' }).click()

    await expect(adminPage.getByText(label)).toBeVisible()

    // cleanup
    await adminPage
      .locator('li', { hasText: label })
      .getByRole('button', { name: 'Delete' })
      .click()
    await expect(adminPage.getByText(label)).not.toBeVisible()
  })

  test('can delete a species and it is removed from the list', async ({
    adminPage,
  }, testInfo) => {
    test.slow()
    const label = `E2E Del ${testInfo.project.name} ${Date.now()}`
    const value = `e2e_del_${Date.now()}`

    await pool.query(
      `INSERT INTO species (label, value, sort_order) VALUES ($1, $2, 999)`,
      [label, value],
    )

    await adminPage.goto('/en/admin/species')
    await expect(adminPage.getByText(label)).toBeVisible()

    await adminPage
      .locator('li', { hasText: label })
      .getByRole('button', { name: 'Delete' })
      .click()

    await expect(adminPage.getByText(label)).not.toBeVisible()
  })
})
