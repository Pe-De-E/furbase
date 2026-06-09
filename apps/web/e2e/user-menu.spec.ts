import { test, expect } from './fixtures'

test.describe('User menu', () => {
  test('avatar visible when logged in', async ({ userPage }) => {
    await userPage.goto('/en')
    await expect(userPage.getByTitle('Your account')).toBeVisible()
  })

  test('dropdown opens on avatar click', async ({ userPage }) => {
    await userPage.goto('/en')
    await userPage.getByTitle('Your account').click()
    await expect(userPage.getByRole('link', { name: /profile/i })).toBeVisible()
    await expect(
      userPage.getByRole('button', { name: /sign out/i }),
    ).toBeVisible()
  })

  test('admin link hidden for regular user', async ({ userPage }) => {
    await userPage.goto('/en')
    await userPage.getByTitle('Your account').click()
    await expect(
      userPage.getByRole('link', { name: /admin panel/i }),
    ).not.toBeVisible()
  })

  test('admin link visible for admin', async ({ adminPage }) => {
    await adminPage.goto('/en')
    await adminPage.getByTitle('Your account').click()
    await expect(
      adminPage.getByRole('link', { name: /admin panel/i }),
    ).toBeVisible()
  })

  test('dropdown closes when clicking outside', async ({ userPage }) => {
    await userPage.goto('/en')
    await userPage.getByTitle('Your account').click()
    await expect(userPage.getByRole('link', { name: /profile/i })).toBeVisible()
    await userPage.locator('main').click({ position: { x: 10, y: 200 } })
    await expect(
      userPage.getByRole('link', { name: /profile/i }),
    ).not.toBeVisible()
  })
})
