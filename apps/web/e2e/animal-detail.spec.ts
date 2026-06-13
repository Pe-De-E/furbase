import { test, expect } from '@playwright/test'

test.describe('Animal detail page', () => {
  test('opens from listing and shows animal info', async ({ page }) => {
    await page.goto('/')
    const firstCard = page.locator('a[href^="/animals/"]').first()
    const animalName = await firstCard.locator('h2').textContent()
    await firstCard.click()

    await expect(page).toHaveURL(/\/animals\/.+/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      animalName!,
    )
  })

  test('shows status badge', async ({ page }) => {
    await page.goto('/')
    await page.locator('a[href^="/animals/"]').first().click()
    await expect(
      page.getByText(/available|reserved|adopted/i).first(),
    ).toBeVisible()
  })

  test('back button returns to listing', async ({ page }) => {
    // explicit /en: the back link text is English, and since i18n the
    // middleware keeps the locale prefix when navigating back
    await page.goto('/en')
    await page.locator('a[href^="/animals/"]').first().click()
    await page.getByRole('link', { name: /back to all animals/i }).click()
    await expect(page).toHaveURL('/en')
  })

  test('unknown animal id shows 404', async ({ page }) => {
    await page.goto('/animals/00000000-0000-0000-0000-000000000000')
    await expect(page).toHaveURL(/\/animals\//)
    // Next.js notFound() renders a 404 page
    await expect(
      page.getByRole('heading', { name: /404|not found/i }),
    ).toBeVisible()
  })
})
