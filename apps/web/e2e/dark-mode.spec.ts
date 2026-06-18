import { test, expect } from '@playwright/test'

function withDark(page: import('@playwright/test').Page) {
  return page.addInitScript(() => localStorage.setItem('theme', 'dark'))
}

test.describe('Dark mode', () => {
  test('html element gets .dark class when theme is dark', async ({ page }) => {
    await withDark(page)
    await page.goto('/en')
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  })

  test('html element does not have .dark class in light mode', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'light'))
    await page.goto('/en')
    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
  })

  test('ThemeToggle button is visible in header', async ({ page }) => {
    await page.goto('/en')
    await expect(page.getByRole('button', { name: /toggle theme/i })).toBeVisible()
  })

  test('clicking ThemeToggle switches to dark mode', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'light'))
    await page.goto('/en')
    await page.getByRole('button', { name: /toggle theme/i }).click()
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  })

  test('clicking ThemeToggle again switches back to light mode', async ({ page }) => {
    await withDark(page)
    await page.goto('/en')
    await page.getByRole('button', { name: /toggle theme/i }).click()
    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
  })

  test.describe('Matcher wizard in dark mode', () => {
    test.beforeEach(async ({ page }) => {
      await withDark(page)
    })

    test('page wrapper has dark background class', async ({ page }) => {
      await page.goto('/en/matcher')
      await expect(page.locator('div.dark\\:bg-zinc-950').first()).toBeAttached()
    })

    test('header has dark background class', async ({ page }) => {
      await page.goto('/en/matcher')
      await expect(page.locator('header.dark\\:bg-zinc-900')).toBeAttached()
    })

    test('wizard renders and is functional in dark mode', async ({ page }) => {
      await page.goto('/en/matcher')
      await expect(page.getByRole('heading', { name: /where do you live/i })).toBeVisible()
      await page.getByText('Apartment').click()
      await expect(page.getByRole('button', { name: /continue/i })).toBeEnabled()
    })

    test('progress bar has dark inactive color', async ({ page }) => {
      await page.goto('/en/matcher')
      // unfilled bars should have the dark variant class
      const unfilledBars = page.locator('.dark\\:bg-zinc-700')
      await expect(unfilledBars.first()).toBeAttached()
    })
  })

  test.describe('Matcher results in dark mode', () => {
    test.beforeEach(async ({ page }) => {
      await withDark(page)
    })

    test('page wrapper has dark background class', async ({ page }) => {
      await page.goto(
        '/en/matcher/results?living=apartment&kids=false&dogs=false&cats=false&activity=low&alone=2-4&experience=beginner&species=&size=any',
      )
      await expect(page.locator('div.dark\\:bg-zinc-950').first()).toBeAttached()
    })

    test('heading is visible in dark mode', async ({ page }) => {
      await page.goto(
        '/en/matcher/results?living=apartment&kids=false&dogs=false&cats=false&activity=low&alone=2-4&experience=beginner&species=&size=any',
      )
      await expect(page.getByRole('heading', { name: /your matches/i })).toBeVisible()
    })

    test('redo questionnaire link is present in dark mode', async ({ page }) => {
      await page.goto(
        '/en/matcher/results?living=apartment&kids=false&dogs=false&cats=false&activity=low&alone=2-4&experience=beginner&species=&size=any',
      )
      await expect(page.getByRole('link', { name: /redo questionnaire/i })).toBeVisible()
    })
  })
})
