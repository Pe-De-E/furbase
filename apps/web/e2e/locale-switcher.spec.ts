import { test, expect } from '@playwright/test'

test.describe('Language switcher', () => {
  test('switches from English to German', async ({ page }) => {
    await page.goto('/en')
    await expect(
      page.getByRole('heading', { name: /animals looking for a home/i }),
    ).toBeVisible()

    await page.getByRole('button', { name: 'DE' }).click()

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

    await page.getByRole('button', { name: 'EN' }).click()

    await expect(page).toHaveURL('/en')
    await expect(
      page.getByRole('heading', { name: /animals looking for a home/i }),
    ).toBeVisible()
  })

  test('switcher shows correct label for current locale', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'EN' })).toBeVisible()

    await page.goto('/en')
    await expect(page.getByRole('button', { name: 'DE' })).toBeVisible()
  })
})
