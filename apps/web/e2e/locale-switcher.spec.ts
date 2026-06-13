import { test, expect } from '@playwright/test'

// Playwright defaults to en-US, so next-intl's Accept-Language detection
// would redirect "/" to "/en" — pin German so "/" stays the German page.
test.use({ locale: 'de-DE' })

// exact: true everywhere — the Next.js dev tools button ("Open Next.js Dev
// Tools") substring-matches both "EN" and "DE" in dev mode.
test.describe('Language switcher', () => {
  test('switches from English to German', async ({ page }) => {
    await page.goto('/en')
    await expect(
      page.getByRole('heading', { name: /animals looking for a home/i }),
    ).toBeVisible()

    await page.getByRole('button', { name: 'DE', exact: true }).click()

    await expect(page).toHaveURL('/')
    await expect(
      page.getByRole('heading', { name: /tiere suchen ein neues zuhause/i }),
    ).toBeVisible()
  })

  test('switches from German to English', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: /tiere suchen ein neues zuhause/i }),
    ).toBeVisible()

    await page.getByRole('button', { name: 'EN', exact: true }).click()

    await expect(page).toHaveURL('/en')
    await expect(
      page.getByRole('heading', { name: /animals looking for a home/i }),
    ).toBeVisible()
  })

  test('switcher shows correct label for current locale', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('button', { name: 'EN', exact: true }),
    ).toBeVisible()

    await page.goto('/en')
    await expect(
      page.getByRole('button', { name: 'DE', exact: true }),
    ).toBeVisible()
  })
})
