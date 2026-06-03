'use client'

import { useTransition } from 'react'
import { updateAnimalStatus } from '../actions'

const STATUS_STYLE: Record<string, string> = {
  available:     'bg-emerald-100 text-emerald-700',
  reserved:      'bg-amber-100 text-amber-700',
  adopted:       'bg-zinc-100 text-zinc-500',
  quarantine:    'bg-red-100 text-red-600',
  not_adoptable: 'bg-red-100 text-red-600',
}

const STATUSES = ['available', 'reserved', 'adopted', 'quarantine', 'not_adoptable'] as const

export default function StatusSelect({ animalId, status }: { animalId: string; status: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={e => {
        startTransition(() =>
          updateAnimalStatus(animalId, e.target.value as typeof STATUSES[number])
        )
      }}
      className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer disabled:opacity-50 ${STATUS_STYLE[status] ?? ''}`}
    >
      {STATUSES.map(s => (
        <option key={s} value={s}>{s.replace('_', ' ')}</option>
      ))}
    </select>
  )
}
