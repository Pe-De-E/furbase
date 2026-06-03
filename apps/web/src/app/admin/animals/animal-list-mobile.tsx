'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { updateAnimalStatus } from '../actions'
import { deleteAnimal } from '../actions'
import type { InferSelectModel } from 'drizzle-orm'
import type { animal } from '@shelter-os/db'

type Animal = InferSelectModel<typeof animal>

const STATUS_STYLE: Record<string, string> = {
  available:     'bg-emerald-100 text-emerald-700',
  reserved:      'bg-amber-100 text-amber-700',
  adopted:       'bg-zinc-100 text-zinc-500',
  quarantine:    'bg-red-100 text-red-600',
  not_adoptable: 'bg-red-100 text-red-600',
}

const STATUSES = ['available', 'reserved', 'adopted', 'quarantine', 'not_adoptable'] as const

function AnimalRow({ animal: a }: { animal: Animal }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <img
          src={a.images?.[0] ?? `https://picsum.photos/seed/${a.id}/80/80`}
          alt={a.name}
          className="w-10 h-10 rounded-lg object-cover bg-zinc-100 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-zinc-900 truncate">{a.name}</p>
          <p className="text-xs text-zinc-400 truncate">{a.breed ?? a.species}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[a.status] ?? ''}`}>
          {a.status.replace('_', ' ')}
        </span>
        <span className="text-zinc-300 text-sm ml-1">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-zinc-100 px-4 py-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-zinc-400">Species</p>
              <p className="capitalize text-zinc-700 mt-0.5">{a.species}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Arrival</p>
              <p className="text-zinc-700 mt-0.5">{a.arrivalDate ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Age</p>
              <p className="text-zinc-700 mt-0.5">{a.age ? `${a.age} months` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Gender</p>
              <p className="capitalize text-zinc-700 mt-0.5">{a.gender ?? '—'}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-zinc-400 mb-1.5">Status</p>
            <select
              value={a.status}
              disabled={isPending}
              onChange={e => startTransition(() =>
                updateAnimalStatus(a.id, e.target.value as typeof STATUSES[number])
              )}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer disabled:opacity-50 ${STATUS_STYLE[a.status] ?? ''}`}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-1">
            <Link
              href={`/admin/animals/${a.id}`}
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => { if (confirm(`Delete ${a.name}?`)) deleteAnimal(a.id) }}
              className="text-sm text-red-400 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AnimalListMobile({ animals }: { animals: Animal[] }) {
  return (
    <div className="flex flex-col gap-3 sm:hidden">
      {animals.map(a => <AnimalRow key={a.id} animal={a} />)}
    </div>
  )
}
