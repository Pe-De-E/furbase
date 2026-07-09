'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB — must match apps/web/src/app/api/upload/route.ts
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export default function ImageUpload({
  defaultImages,
}: {
  defaultImages: string[]
}) {
  const t = useTranslations('AnimalForm')
  const [images, setImages] = useState<string[]>(defaultImages)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    setUploading(true)
    setErrors([])
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
          setErrors((prev) => [...prev, `${file.name} ${t('imageTooLarge')}`])
          continue
        }
        if (!ALLOWED_MIME_TYPES.has(file.type)) {
          setErrors((prev) => [...prev, `${file.name} ${t('unsupportedFormat')}`])
          continue
        }
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) {
          const message =
            res.status === 413
              ? t('imageTooLarge')
              : res.status === 400
                ? t('unsupportedFormat')
                : t('uploadFailed')
          setErrors((prev) => [...prev, `${file.name} ${message}`])
          continue
        }
        const { url } = (await res.json()) as { url: string }
        setImages((prev) => [...prev, url])
      }
    } finally {
      setUploading(false)
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url))
    // Images already saved to the animal are only unlinked on the next successful
    // save (see saveAnimal in ../actions.ts) — only clean up files that were
    // uploaded in this session and never made it into a saved animal record.
    if (!defaultImages.includes(url)) {
      fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      }).catch(() => {})
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {images.map((url) => (
        <input key={url} type="hidden" name="images" value={url} />
      ))}

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url) => (
            <div key={url} className="relative group">
              <img
                src={url}
                alt=""
                className="w-24 h-24 object-cover rounded-xl border border-zinc-200"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
        >
          {uploading ? t('uploading') : t('uploadImages')}
        </button>
      </div>

      {errors.length > 0 && (
        <ul className="text-sm text-red-600 dark:text-red-400 flex flex-col gap-0.5">
          {errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
