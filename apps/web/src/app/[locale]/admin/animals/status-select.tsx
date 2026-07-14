'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { updateAnimalStatus } from '../actions'

const STATUS_STYLE: Record<string, string> = {
  available: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
  reserved: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
  adopted: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400',
  quarantine: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300',
  not_adoptable: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300',
}

const STATUSES = [
  'available',
  'reserved',
  'adopted',
  'quarantine',
  'not_adoptable',
] as const

export default function StatusSelect({
  animalId,
  status,
}: {
  animalId: string
  status: string
}) {
  const t = useTranslations('AnimalForm')
  const [isPending, startTransition] = useTransition()

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => {
        startTransition(() =>
          updateAnimalStatus(
            animalId,
            e.target.value as (typeof STATUSES)[number],
          ),
        )
      }}
      className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer disabled:opacity-50 ${STATUS_STYLE[status] ?? ''}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {t(`status.${s}` as Parameters<typeof t>[0])}
        </option>
      ))}
    </select>
  )
}
