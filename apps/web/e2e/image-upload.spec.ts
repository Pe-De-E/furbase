import { test, expect } from './fixtures'
import { Pool } from 'pg'

let pool: Pool

// minimal 1×1 white PNG — valid enough for sharp to process
const MIN_PNG = {
  name: 'test.png',
  mimeType: 'image/png' as const,
  buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64',
  ),
}

test.beforeAll(async () => {
  pool = new Pool({ connectionString: process.env.DATABASE_URL })
})

test.afterAll(async () => {
  await pool.end()
})

// ─── API ──────────────────────────────────────────────────────────────────────

test.describe('Image upload — API', () => {
  test('rejects non-admin requests with 403', async ({ userPage }) => {
    const res = await userPage.request.post('/api/upload', {
      multipart: { file: MIN_PNG },
    })
    expect(res.status()).toBe(403)
  })

  test('admin upload returns a webp URL', async ({ adminPage }) => {
    const res = await adminPage.request.post('/api/upload', {
      multipart: { file: MIN_PNG },
    })
    expect(res.status()).toBe(200)
    const body = (await res.json()) as { url: string }
    expect(body.url).toMatch(/^\/uploads\/animals\/.+\.webp$/)
  })

  test('rejects a non-image file with 400', async ({ adminPage }) => {
    const res = await adminPage.request.post('/api/upload', {
      multipart: {
        file: {
          name: 'test.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('not an image'),
        },
      },
    })
    expect(res.status()).toBe(400)
  })

  test('rejects a structurally valid but disallowed format (gif) with 400', async ({
    adminPage,
  }) => {
    const res = await adminPage.request.post('/api/upload', {
      multipart: {
        file: {
          name: 'test.gif',
          mimeType: 'image/gif',
          buffer: Buffer.from(
            'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
            'base64',
          ),
        },
      },
    })
    expect(res.status()).toBe(400)
  })

  test('rejects a file over the size limit with 413', async ({ adminPage }) => {
    const res = await adminPage.request.post('/api/upload', {
      multipart: {
        file: {
          name: 'huge.png',
          mimeType: 'image/png',
          buffer: Buffer.alloc(11 * 1024 * 1024),
        },
      },
    })
    expect(res.status()).toBe(413)
  })
})

// ─── UI ───────────────────────────────────────────────────────────────────────

test.describe('Image upload — UI', () => {
  let animalId: string

  test.beforeEach(async ({}, testInfo) => {
    const { rows } = await pool.query(
      `INSERT INTO animal (name, species, status)
       VALUES ($1, 'dog', 'available') RETURNING id`,
      [`E2E-Upload ${testInfo.project.name} ${Date.now()}`],
    )
    animalId = rows[0].id
  })

  test.afterEach(async () => {
    await pool.query(`DELETE FROM animal WHERE id = $1`, [animalId])
  })

  test('uploading a file shows a preview', async ({ adminPage }) => {
    await adminPage.goto(`/en/admin/animals/${animalId}`)
    await expect(
      adminPage.getByRole('heading', { name: 'Edit' }),
    ).toBeVisible({ timeout: 30000 })

    await adminPage.locator('input[type="file"]').setInputFiles(MIN_PNG)

    await expect(adminPage.locator('img[src^="/uploads"]')).toBeVisible({
      timeout: 15000,
    })
  })

  test('can remove an image from the preview', async ({ adminPage }) => {
    await adminPage.goto(`/en/admin/animals/${animalId}`)
    await expect(
      adminPage.getByRole('heading', { name: 'Edit' }),
    ).toBeVisible({ timeout: 30000 })

    await adminPage.locator('input[type="file"]').setInputFiles(MIN_PNG)
    const preview = adminPage.locator('img[src^="/uploads"]')
    await expect(preview).toBeVisible({ timeout: 15000 })

    // button is opacity-0 until hover — force the click
    await adminPage.locator('button', { hasText: '×' }).click({ force: true })
    await expect(preview).not.toBeVisible()
  })

  test('shows an error for a non-image file', async ({ adminPage }) => {
    await adminPage.goto(`/en/admin/animals/${animalId}`)
    await expect(
      adminPage.getByRole('heading', { name: 'Edit' }),
    ).toBeVisible({ timeout: 30000 })

    await adminPage.locator('input[type="file"]').setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not an image'),
    })

    await expect(adminPage.getByText(/unsupported format/i)).toBeVisible()
    await expect(adminPage.locator('img[src^="/uploads"]')).not.toBeVisible()
  })

  test('shows an error for a file over the size limit without uploading it', async ({
    adminPage,
  }) => {
    await adminPage.goto(`/en/admin/animals/${animalId}`)
    await expect(
      adminPage.getByRole('heading', { name: 'Edit' }),
    ).toBeVisible({ timeout: 30000 })

    await adminPage.locator('input[type="file"]').setInputFiles({
      name: 'huge.png',
      mimeType: 'image/png',
      buffer: Buffer.alloc(11 * 1024 * 1024),
    })

    await expect(adminPage.getByText(/too large/i)).toBeVisible()
    await expect(adminPage.locator('img[src^="/uploads"]')).not.toBeVisible()
  })

  test('shows an error for an unsupported format (gif)', async ({
    adminPage,
  }) => {
    await adminPage.goto(`/en/admin/animals/${animalId}`)
    await expect(
      adminPage.getByRole('heading', { name: 'Edit' }),
    ).toBeVisible({ timeout: 30000 })

    await adminPage.locator('input[type="file"]').setInputFiles({
      name: 'test.gif',
      mimeType: 'image/gif',
      buffer: Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
        'base64',
      ),
    })

    await expect(adminPage.getByText(/unsupported format/i)).toBeVisible()
    await expect(adminPage.locator('img[src^="/uploads"]')).not.toBeVisible()
  })

  test('uploaded image url is persisted after save', async ({ adminPage }) => {
    test.slow()
    await adminPage.goto(`/en/admin/animals/${animalId}`)
    await expect(
      adminPage.getByRole('heading', { name: 'Edit' }),
    ).toBeVisible({ timeout: 30000 })

    await adminPage.locator('input[type="file"]').setInputFiles(MIN_PNG)
    await expect(adminPage.locator('img[src^="/uploads"]')).toBeVisible({
      timeout: 15000,
    })

    await adminPage.getByRole('button', { name: 'Save changes' }).click()
    await expect(adminPage).toHaveURL(/\/admin\/animals$/, { timeout: 15000 })

    const { rows } = await pool.query(
      `SELECT images FROM animal WHERE id = $1`,
      [animalId],
    )
    expect(rows[0].images).toHaveLength(1)
    expect(rows[0].images[0]).toMatch(/^\/uploads\/animals\/.+\.webp$/)
  })
})
