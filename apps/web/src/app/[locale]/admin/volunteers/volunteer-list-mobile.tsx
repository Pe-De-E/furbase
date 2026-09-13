'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { setVolunteerGrant, type GrantField } from './actions'

const ROLE_KEYS = ['canFoster', 'canTransport', 'canWalkDogs', 'canHelp'] as const

const GRANT_FIELD: Record<(typeof ROLE_KEYS)[number], GrantField> = {
  canFoster: 'grantedFoster',
  canTransport: 'grantedTransport',
  canWalkDogs: 'grantedWalkDogs',
  canHelp: 'grantedHelp',
}

const ROLE_COLOR: Record<string, string> = {
  canFoster: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
  canTransport: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
  canWalkDogs: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
  canHelp: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
}

type Row = {
  volunteer: {
    id: string
    canFoster: boolean | null
    canTransport: boolean | null
    canWalkDogs: boolean | null
    canHelp: boolean | null
    notes: string | null
    grantedFoster: boolean
    grantedTransport: boolean
    grantedWalkDogs: boolean
    grantedHelp: boolean
  }
  user: { name: string | null; email: string; image: string | null }
}

function VolunteerRow({ row: { volunteer: v, user: u } }: { row: Row }) {
  const t = useTranslations('AdminVolunteers')
  const [open, setOpen] = useState(false)
  const activeRoles = ROLE_KEYS.filter((k) => v[k])
  const hasAnyGrant = ROLE_KEYS.some((k) => v[GRANT_FIELD[k]])

  return (
    <div
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden"
      data-testid="volunteer-card"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 relative overflow-hidden shrink-0 flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-sm font-medium">
          {u.name?.[0] ?? '?'}
          {u.image && (
            <Image
              src={u.image}
              alt=""
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{u.name ?? '—'}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{u.email}</p>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${
            hasAnyGrant
              ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
          }`}
        >
          {hasAnyGrant ? t('statusApproved') : t('statusPending')}
        </span>
        <span className="text-zinc-300 dark:text-zinc-600 text-sm ml-1">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-4 flex flex-col gap-4">
          {activeRoles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeRoles.map((k) => {
                const granted = v[GRANT_FIELD[k]]
                return (
                  <form key={k} action={setVolunteerGrant.bind(null, v.id, GRANT_FIELD[k], !granted)}>
                    <button
                      type="submit"
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                        granted
                          ? `${ROLE_COLOR[k]} border-transparent`
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-500'
                      }`}
                    >
                      {t(`roles.${k}` as Parameters<typeof t>[0])}
                      {granted ? ' ✓' : ''}
                    </button>
                  </form>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">{t('noActiveOffers')}</p>
          )}
          {v.notes && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-3">
              {v.notes}
            </p>
          )}
          <a
            href={`mailto:${u.email}`}
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {t('contactEmail')}
          </a>
        </div>
      )}
    </div>
  )
}

export default function VolunteerListMobile({ rows }: { rows: Row[] }) {
  return (
    <div className="flex flex-col gap-3 sm:hidden" data-testid="volunteer-list-mobile">
      {rows.map((row) => (
        <VolunteerRow key={row.volunteer.id} row={row} />
      ))}
    </div>
  )
}
