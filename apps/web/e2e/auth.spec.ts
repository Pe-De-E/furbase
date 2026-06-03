import { test, expect } from '@playwright/test'

test.describe('Auth & protected routes', () => {
  test('profile redirects to sign in when not logged in', async ({ page }) => {
    await page.goto('/profile')
    // Should redirect to sign in
    await expect(page).toHaveURL(/signin|auth/)
  })

  test('admin redirects to sign in when not logged in', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/signin|auth/)
  })

  test('admin/animals redirects to sign in when not logged in', async ({ page }) => {
    await page.goto('/admin/animals')
    await expect(page).toHaveURL(/signin|auth/)
  })

  test('sign in button visible in header when logged out', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })
})
