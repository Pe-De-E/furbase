'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { updateAnimalStatus } from '../actions'
import { deleteAnimal } from '../actions'
import type { InferSelectModel } from 'drizzle-orm'
import type { animal } from '@furbase/db'
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog'

type Animal = InferSelectModel<typeof animal>

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

function AnimalRow({ animal: a }: { animal: Animal }) {
  const t = useTranslations('AdminAnimals')
  const tf = useTranslations('AnimalForm')
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  return (
    <div
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden"
      data-testid="animal-card"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <img
          src={a.images?.[0] ?? `https://picsum.photos/seed/${a.id}/80/80`}
          alt={a.name}
          className="w-10 h-10 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{a.name}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
            {a.breed ?? a.species}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[a.status] ?? ''}`}
        >
          {tf(`status.${a.status}` as Parameters<typeof tf>[0])}
        </span>
        <span className="text-zinc-300 dark:text-zinc-600 text-sm ml-1">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{t('fieldSpecies')}</p>
              <p className="capitalize text-zinc-700 dark:text-zinc-300 mt-0.5">{a.species}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{t('fieldArrival')}</p>
              <p className="text-zinc-700 dark:text-zinc-300 mt-0.5">{a.arrivalDate ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{t('fieldAge')}</p>
              <p className="text-zinc-700 dark:text-zinc-300 mt-0.5">
                {a.age ? t('fieldAgeMonths', { months: a.age }) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{t('fieldGender')}</p>
              <p className="capitalize text-zinc-700 dark:text-zinc-300 mt-0.5">
                {a.gender ? tf(`gender.${a.gender}` as Parameters<typeof tf>[0]) : '—'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1.5">{t('fieldStatus')}</p>
            <select
              value={a.status}
              disabled={isPending}
              onChange={(e) =>
                startTransition(() =>
                  updateAnimalStatus(
                    a.id,
                    e.target.value as (typeof STATUSES)[number],
                  ),
                )
              }
              className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer disabled:opacity-50 ${STATUS_STYLE[a.status] ?? ''}`}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {tf(`status.${s}` as Parameters<typeof tf>[0])}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-1">
            <Link
              href={`/admin/animals/${a.id}`}
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {t('edit')}
            </Link>
            <ConfirmDeleteDialog
              trigger={t('delete')}
              triggerClassName="text-sm text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title={t('deleteConfirm', { name: a.name })}
              description={t('deleteWarning')}
              confirmLabel={t('delete')}
              cancelLabel={t('cancel')}
              onConfirm={() => deleteAnimal(a.id)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function AnimalListMobile({ animals }: { animals: Animal[] }) {
  return (
    <div className="flex flex-col gap-3 sm:hidden" data-testid="animal-list-mobile">
      {animals.map((a) => (
        <AnimalRow key={a.id} animal={a} />
      ))}
    </div>
  )
}
