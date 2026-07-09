import { unlink } from 'fs/promises'
import path from 'path'

export const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'animals')

const UPLOAD_URL_PATTERN = /^\/uploads\/animals\/([a-f0-9-]+\.webp)$/

export function uploadFilenameFromUrl(url: string): string | null {
  return url.match(UPLOAD_URL_PATTERN)?.[1] ?? null
}

export async function deleteUploadedImages(urls: string[]): Promise<void> {
  await Promise.all(
    urls.map(async (url) => {
      const filename = uploadFilenameFromUrl(url)
      if (!filename) return
      await unlink(path.join(UPLOAD_DIR, filename)).catch(() => {})
    }),
  )
}
