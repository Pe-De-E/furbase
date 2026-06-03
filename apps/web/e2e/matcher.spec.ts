import { test, expect } from '@playwright/test'

test.describe('Matcher wizard', () => {
  test('progress bar advances on each step', async ({ page }) => {
    await page.goto('/matcher')
    // Step 1 — first bar should be filled
    const bars = page.locator('.h-1.flex-1.rounded-full')
    await expect(bars.first()).toHaveClass(/bg-zinc-900/)

    await page.getByText('Apartment').click()
    await page.getByRole('button', { name: /continue/i }).click()
    // now 2 bars should be filled
    await expect(bars.nth(1)).toHaveClass(/bg-zinc-900/)
  })

  test('cannot continue without answering required steps', async ({ page }) => {
    await page.goto('/matcher')
    const continueBtn = page.getByRole('button', { name: /continue/i })
    await expect(continueBtn).toBeDisabled()
    await page.getByText('Apartment').click()
    await expect(continueBtn).toBeEnabled()
  })

  test('completes full wizard and reaches results', async ({ page }) => {
    await page.goto('/matcher')

    // Step 1: living situation
    await page.getByText('Apartment').click()
    await page.getByRole('button', { name: /continue/i }).click()

    // Step 2: household (optional toggles — skip, just continue)
    await page.getByRole('button', { name: /continue/i }).click()

    // Step 3: activity
    await page.getByText('Medium').first().click()
    await page.getByRole('button', { name: /continue/i }).click()

    // Step 4: hours alone
    await page.getByText('2-4 hours').click()
    await page.getByRole('button', { name: /continue/i }).click()

    // Step 5: experience
    await page.getByText('Beginner').click()
    await page.getByRole('button', { name: /continue/i }).click()

    // Step 6: preferences — just submit
    await page.getByRole('button', { name: /find my match/i }).click()

    await expect(page).toHaveURL(/\/matcher\/results/)
    await expect(page.getByRole('heading', { name: /your matches/i })).toBeVisible()
  })

  test('results show compatible and incompatible sections', async ({ page }) => {
    await page.goto('/matcher/results?living=apartment&kids=false&dogs=false&cats=false&activity=low&alone=2-4&experience=beginner&species=&size=any')
    await expect(page.getByRole('heading', { name: /your matches/i })).toBeVisible()
  })
})
