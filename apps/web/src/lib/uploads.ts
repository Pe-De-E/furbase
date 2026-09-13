import { unlink } from 'fs/promises'
import path from 'path'

export const UPLOAD_CATEGORIES = ['animals', 'gassigeher'] as const
export type UploadCategory = (typeof UPLOAD_CATEGORIES)[number]

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads')

export function uploadDir(category: UploadCategory): string {
  return path.join(UPLOADS_ROOT, category)
}

const UPLOAD_URL_PATTERN = /^\/uploads\/(animals|gassigeher)\/([a-f0-9-]+\.webp)$/

export function uploadFilenameFromUrl(url: string): string | null {
  return url.match(UPLOAD_URL_PATTERN)?.[2] ?? null
}

function categoryFromUrl(url: string): UploadCategory | null {
  return (url.match(UPLOAD_URL_PATTERN)?.[1] as UploadCategory) ?? null
}

export async function deleteUploadedImages(urls: string[]): Promise<void> {
  await Promise.all(
    urls.map(async (url) => {
      const filename = uploadFilenameFromUrl(url)
      const category = categoryFromUrl(url)
      if (!filename || !category) return
      await unlink(path.join(uploadDir(category), filename)).catch(() => {})
    }),
  )
}
