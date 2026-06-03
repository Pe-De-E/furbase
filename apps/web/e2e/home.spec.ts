import { test, expect } from '@playwright/test'

test.describe('Home — animal listing', () => {
  test('loads and shows animals', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /animals looking for a home/i })).toBeVisible()
    // at least one animal card
    await expect(page.locator('a[href^="/animals/"]').first()).toBeVisible()
  })

  test('shows animal count', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/animals? available/i)).toBeVisible()
  })

  test('species filter shows only matching animals', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Dogs' }).click()
    await expect(page).toHaveURL('/?species=dog')
    // all visible species labels should be "Dog"
    const speciesLabels = page.locator('text=Dog ·')
    await expect(speciesLabels.first()).toBeVisible()
  })

  test('empty state when no animals match filter', async ({ page }) => {
    await page.goto('/?species=bird')
    await expect(page.getByText(/no animals found/i)).toBeVisible()
  })

  test('find my match button links to matcher', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /find my match/i }).click()
    await expect(page).toHaveURL('/matcher')
  })
})
