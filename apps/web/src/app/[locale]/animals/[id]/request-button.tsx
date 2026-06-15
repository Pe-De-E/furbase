'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { createAdoptionRequest } from './actions'

type Props = {
  animalId: string
  animalName: string
  isLoggedIn: boolean
  hasExistingRequest: boolean
}

export default function RequestButton({ animalId, animalName, isLoggedIn, hasExistingRequest }: Props) {
  const t = useTranslations('RequestButton')
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(hasExistingRequest)
  const [isPending, startTransition] = useTransition()

  if (!isLoggedIn) {
    return (
      <a
        href="/api/auth/signin"
        className="w-full block text-center bg-zinc-900 text-white rounded-xl py-3.5 text-sm font-medium hover:bg-zinc-700 transition-colors mt-2"
      >
        {t('signIn')}
      </a>
    )
  }

  if (done) {
    return (
      <div className="w-full mt-2 rounded-xl py-3.5 px-4 text-sm font-medium text-center bg-emerald-50 border border-emerald-200 text-emerald-700">
        ✓ {t('success')}
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-zinc-900 text-white rounded-xl py-3.5 text-sm font-medium hover:bg-zinc-700 transition-colors mt-2"
      >
        {t('request', { name: animalName })}
      </button>
    )
  }

  return (
    <div className="mt-2 flex flex-col gap-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t('messagePlaceholder')}
        rows={4}
        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-300"
      />
      <div className="flex gap-2">
        <button
          onClick={() => setOpen(false)}
          className="flex-1 rounded-xl py-3 text-sm font-medium border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          {t('cancel')}
        </button>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await createAdoptionRequest(animalId, message || null)
              setDone(true)
              setOpen(false)
            })
          }
          className="flex-1 bg-zinc-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {isPending ? t('submitting') : t('submit')}
        </button>
      </div>
    </div>
  )
}
