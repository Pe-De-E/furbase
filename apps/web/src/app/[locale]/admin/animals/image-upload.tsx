'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'

export default function ImageUpload({
  defaultImages,
}: {
  defaultImages: string[]
}) {
  const t = useTranslations('AnimalForm')
  const [images, setImages] = useState<string[]>(defaultImages)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) continue
        const { url } = (await res.json()) as { url: string }
        setImages((prev) => [...prev, url])
      }
    } finally {
      setUploading(false)
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
                onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
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
          accept="image/*"
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
    </div>
  )
}
