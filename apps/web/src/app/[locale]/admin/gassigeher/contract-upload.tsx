'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB — must match apps/web/src/app/api/upload/route.ts
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export default function ContractUpload({
  defaultImage,
}: {
  defaultImage: string | null
}) {
  const t = useTranslations('GassigeherForm')
  const [image, setImage] = useState<string | null>(defaultImage)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    try {
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} ${t('imageTooLarge')}`)
        return
      }
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        setError(`${file.name} ${t('unsupportedFormat')}`)
        return
      }
      const fd = new FormData()
      fd.append('file', file)
      fd.append('category', 'gassigeher')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const message =
          res.status === 413
            ? t('imageTooLarge')
            : res.status === 400
              ? t('unsupportedFormat')
              : t('uploadFailed')
        setError(`${file.name} ${message}`)
        return
      }
      const { url } = (await res.json()) as { url: string }
      const previous = image
      setImage(url)
      if (previous && previous !== defaultImage) {
        fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: previous }),
        }).catch(() => {})
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="contractImage" value={image ?? ''} />

      {image && (
        <Image
          src={image}
          alt=""
          width={160}
          height={160}
          className="w-40 h-40 object-cover rounded-xl border border-zinc-200 dark:border-zinc-700"
        />
      )}

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          {uploading ? t('uploading') : image ? t('replaceImage') : t('uploadImage')}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
