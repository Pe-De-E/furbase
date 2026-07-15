import { test, expect } from './fixtures'
import type { Page } from '@playwright/test'
import { Pool } from 'pg'

let pool: Pool

test.beforeAll(async () => {
  pool = new Pool({ connectionString: process.env.DATABASE_URL })
})

test.afterAll(async () => {
  await pool.end()
})

// The animals list renders a desktop table and a mobile card list at the
// same time (CSS-hidden depending on viewport) — these helpers scope to
// whichever one is actually visible, via the data-testid on each wrapper.
// Mobile cards start collapsed, so entry-scoped actions open the card first.
// Button lookups use exact:true because generated test names ("E2E-Delete
// ...") can otherwise substring-match the "Delete" button itself.
async function entryFor(page: Page, name: string, mobile: boolean) {
  if (mobile) {
    const card = page
      .getByTestId('animal-list-mobile')
      .getByTestId('animal-card')
      .filter({ hasText: name })
    await card.getByRole('button').first().click() // expand
    return card
  }
  return page.getByTestId('animal-list-desktop').getByRole('row').filter({ hasText: name })
}

function entryText(page: Page, name: string, mobile: boolean) {
  const container = mobile
    ? page.getByTestId('animal-list-mobile')
    : page.getByTestId('animal-list-desktop')
  return container.getByText(name)
}

// ─── List ─────────────────────────────────────────────────────────────────────

test.describe('Admin animals — list', () => {
  test('shows the animals list and add button', async ({ adminPage }, testInfo) => {
    await adminPage.goto('/en/admin/animals')
    await expect(
      adminPage.getByRole('heading', { name: 'Animals' }),
    ).toBeVisible()
    await expect(
      adminPage.getByRole('link', { name: '+ Add animal' }),
    ).toBeVisible()

    if (testInfo.project.name === 'mobile') {
      await expect(adminPage.getByTestId('animal-list-mobile')).toBeVisible()
    } else {
      await expect(adminPage.getByRole('columnheader', { name: 'Animal' })).toBeVisible()
    }
  })
})

// ─── Create ───────────────────────────────────────────────────────────────────

test.describe('Admin animals — create', () => {
  test('can create a new animal and it appears in the list', async ({
    adminPage,
  }, testInfo) => {
    test.slow()
    const mobile = testInfo.project.name === 'mobile'
    const name = `E2E-Dog ${testInfo.project.name} ${Date.now()}`

    await adminPage.goto('/en/admin/animals/new')
    await expect(
      adminPage.getByRole('heading', { name: 'Basic info' }),
    ).toBeVisible({ timeout: 30000 })

    await adminPage.locator('input[name="name"]').fill(name)
    await adminPage.locator('select[name="species"]').selectOption('dog')
    await adminPage.getByRole('button', { name: 'Add animal' }).click()

    await expect(adminPage).toHaveURL(/\/admin\/animals$/)
    await expect(entryText(adminPage, name, mobile)).toBeVisible()

    // cleanup via UI
    const entry = await entryFor(adminPage, name, mobile)
    await entry.getByRole('button', { name: 'Delete', exact: true }).click()
    const cleanupDialog = adminPage.getByRole('alertdialog')
    await expect(cleanupDialog).toBeVisible()
    await cleanupDialog.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(entryText(adminPage, name, mobile)).not.toBeVisible()
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
    const mobile = testInfo.project.name === 'mobile'
    const updatedName = `E2E-Updated ${testInfo.project.name} ${Date.now()}`

    await adminPage.goto(`/en/admin/animals/${animalId}`)
    await adminPage.locator('input[name="name"]').fill(updatedName)
    await adminPage.getByRole('button', { name: 'Save changes' }).click()

    await expect(adminPage).toHaveURL(/\/admin\/animals$/)
    await expect(entryText(adminPage, updatedName, mobile)).toBeVisible()
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
  }, testInfo) => {
    const mobile = testInfo.project.name === 'mobile'
    await adminPage.goto('/en/admin/animals')
    await expect(entryText(adminPage, animalName, mobile)).toBeVisible()

    const entry = await entryFor(adminPage, animalName, mobile)
    await entry.getByRole('button', { name: 'Delete', exact: true }).click()
    const confirmDialog = adminPage.getByRole('alertdialog')
    await expect(confirmDialog).toBeVisible()
    await confirmDialog.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(entryText(adminPage, animalName, mobile)).not.toBeVisible()
  })

  test('dismiss confirm dialog keeps the animal', async ({ adminPage }, testInfo) => {
    const mobile = testInfo.project.name === 'mobile'
    await adminPage.goto('/en/admin/animals')

    const entry = await entryFor(adminPage, animalName, mobile)
    await entry.getByRole('button', { name: 'Delete', exact: true }).click()
    const confirmDialog = adminPage.getByRole('alertdialog')
    await expect(confirmDialog).toBeVisible()
    await confirmDialog.getByRole('button', { name: 'Cancel', exact: true }).click()
    await expect(confirmDialog).not.toBeVisible()
    await expect(entryText(adminPage, animalName, mobile)).toBeVisible()
  })

  test('delete from edit page removes the animal', async ({ adminPage }, testInfo) => {
    test.slow()
    const mobile = testInfo.project.name === 'mobile'
    await adminPage.goto(`/en/admin/animals/${animalId}`)
    await adminPage.getByRole('button', { name: 'Delete animal' }).click()

    await expect(adminPage).toHaveURL(/\/admin\/animals$/)
    await expect(entryText(adminPage, animalName, mobile)).not.toBeVisible()
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
  }, testInfo) => {
    const mobile = testInfo.project.name === 'mobile'
    await adminPage.goto('/en/admin/animals')

    const entry = await entryFor(adminPage, animalName, mobile)
    const select = entry.locator('select')

    await expect(select).toHaveValue('available')
    await select.selectOption('reserved')

    // wait for the server action to complete (select re-enables)
    await expect(select).toBeEnabled({ timeout: 10000 })

    await adminPage.reload()
    const entryAfterReload = await entryFor(adminPage, animalName, mobile)
    await expect(entryAfterReload.locator('select')).toHaveValue('reserved')
  })
})

// ─── Header profile menu ──────────────────────────────────────────────────────

test.describe('Admin header — profile menu', () => {
  test('avatar menu opens with profile and sign-out links', async ({ adminPage }) => {
    await adminPage.goto('/en/admin/animals')

    await adminPage.locator('button[title="Your account"]').click()
    await expect(adminPage.getByRole('link', { name: 'Profile' })).toBeVisible()
    await expect(adminPage.getByRole('button', { name: 'Sign out' })).toBeVisible()
  })
})
