import { test, expect } from './fixtures'
import { Pool } from 'pg'

let pool: Pool

test.beforeAll(async () => {
  pool = new Pool({ connectionString: process.env.DATABASE_URL })
})

test.afterAll(async () => {
  await pool.end()
})

// ─── List ─────────────────────────────────────────────────────────────────────

test.describe('Admin animals — list', () => {
  test('shows the animals table and add button', async ({ adminPage }) => {
    await adminPage.goto('/en/admin/animals')
    await expect(
      adminPage.getByRole('heading', { name: 'Animals' }),
    ).toBeVisible()
    await expect(
      adminPage.getByRole('link', { name: '+ Add animal' }),
    ).toBeVisible()
    await expect(adminPage.getByRole('columnheader', { name: 'Animal' })).toBeVisible()
  })
})

// ─── Create ───────────────────────────────────────────────────────────────────

test.describe('Admin animals — create', () => {
  test('can create a new animal and it appears in the list', async ({
    adminPage,
  }, testInfo) => {
    test.slow()
    const name = `E2E-Dog ${testInfo.project.name} ${Date.now()}`

    await adminPage.goto('/en/admin/animals/new')
    await expect(
      adminPage.getByRole('heading', { name: 'Basic info' }),
    ).toBeVisible({ timeout: 30000 })

    await adminPage.locator('input[name="name"]').fill(name)
    await adminPage.locator('select[name="species"]').selectOption('dog')
    await adminPage.getByRole('button', { name: 'Add animal' }).click()

    await expect(adminPage).toHaveURL(/\/admin\/animals$/)
    await expect(adminPage.getByText(name).first()).toBeVisible()

    // cleanup via UI
    adminPage.on('dialog', (d) => d.accept())
    await adminPage
      .getByRole('row')
      .filter({ hasText: name })
      .getByRole('button', { name: 'Delete' })
      .click()
    await expect(adminPage.getByText(name)).not.toBeVisible()
  })
})

// ─── Edit ─────────────────────────────────────────────────────────────────────

test.describe('Admin animals — edit', () => {
  let animalId: string
  let originalName: string

  test.beforeEach(async ({}, testInfo) => {
    originalName = `E2E-Edit ${testInfo.project.name} ${Date.now()}`
    const { rows } = await pool.query(
      `INSERT INTO animal (name, species, status)
       VALUES ($1, 'dog', 'available') RETURNING id`,
      [originalName],
    )
    animalId = rows[0].id
  })

  test.afterEach(async () => {
    await pool.query(`DELETE FROM animal WHERE id = $1`, [animalId])
  })

  test('edit page shows the animal name pre-filled', async ({ adminPage }) => {
    await adminPage.goto(`/en/admin/animals/${animalId}`)
    await expect(adminPage.locator('input[name="name"]')).toHaveValue(
      originalName,
    )
  })

  test('can update the animal name and see it in the list', async ({
    adminPage,
  }, testInfo) => {
    test.slow()
    const updatedName = `E2E-Updated ${testInfo.project.name} ${Date.now()}`

    await adminPage.goto(`/en/admin/animals/${animalId}`)
    await adminPage.locator('input[name="name"]').fill(updatedName)
    await adminPage.getByRole('button', { name: 'Save changes' }).click()

    await expect(adminPage).toHaveURL(/\/admin\/animals$/)
    await expect(adminPage.getByText(updatedName)).toBeVisible()
  })
})

// ─── Delete ───────────────────────────────────────────────────────────────────

test.describe('Admin animals — delete', () => {
  let animalId: string
  let animalName: string

  test.beforeEach(async ({}, testInfo) => {
    animalName = `E2E-Delete ${testInfo.project.name} ${Date.now()}`
    const { rows } = await pool.query(
      `INSERT INTO animal (name, species, status)
       VALUES ($1, 'dog', 'available') RETURNING id`,
      [animalName],
    )
    animalId = rows[0].id
  })

  test.afterEach(async () => {
    // no-op if already deleted by test; safe to run
    await pool.query(`DELETE FROM animal WHERE id = $1`, [animalId])
  })

  test('delete from list with confirm dialog removes the animal', async ({
    adminPage,
  }) => {
    adminPage.on('dialog', (d) => d.accept())

    await adminPage.goto('/en/admin/animals')
    const row = adminPage.getByRole('row').filter({ hasText: animalName })
    await expect(row).toBeVisible()
    await row.getByRole('button', { name: 'Delete' }).click()
    await expect(adminPage.getByText(animalName)).not.toBeVisible()
  })

  test('dismiss confirm dialog keeps the animal', async ({ adminPage }) => {
    adminPage.on('dialog', (d) => d.dismiss())

    await adminPage.goto('/en/admin/animals')
    const row = adminPage.getByRole('row').filter({ hasText: animalName })
    await row.getByRole('button', { name: 'Delete' }).click()
    await expect(adminPage.getByText(animalName)).toBeVisible()
  })

  test('delete from edit page removes the animal', async ({ adminPage }) => {
    test.slow()
    await adminPage.goto(`/en/admin/animals/${animalId}`)
    await adminPage.getByRole('button', { name: 'Delete animal' }).click()

    await expect(adminPage).toHaveURL(/\/admin\/animals$/)
    await expect(adminPage.getByText(animalName)).not.toBeVisible()
  })
})

// ─── Status change ────────────────────────────────────────────────────────────

test.describe('Admin animals — inline status change', () => {
  let animalId: string
  let animalName: string

  test.beforeEach(async ({}, testInfo) => {
    animalName = `E2E-Status ${testInfo.project.name} ${Date.now()}`
    const { rows } = await pool.query(
      `INSERT INTO animal (name, species, status)
       VALUES ($1, 'dog', 'available') RETURNING id`,
      [animalName],
    )
    animalId = rows[0].id
  })

  test.afterEach(async () => {
    await pool.query(`DELETE FROM animal WHERE id = $1`, [animalId])
  })

  test('changing status dropdown persists after reload', async ({
    adminPage,
  }) => {
    await adminPage.goto('/en/admin/animals')

    const row = adminPage.getByRole('row').filter({ hasText: animalName })
    const select = row.locator('select')

    await expect(select).toHaveValue('available')
    await select.selectOption('reserved')

    // wait for the server action to complete (select re-enables)
    await expect(select).toBeEnabled({ timeout: 10000 })

    await adminPage.reload()
    await expect(
      adminPage.getByRole('row').filter({ hasText: animalName }).locator('select'),
    ).toHaveValue('reserved')
  })
})
