'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const KATEGORIE_COLOR: Record<string, string> = {
  gruen: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
  gelb: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
  rot: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
}

type Row = {
  userId: string
  name: string | null
  email: string
  image: string | null
  fileId: string | null
  contractImageUrl: string | null
  kategorie: string | null
  aufnahme: boolean | null
}

export default function GassigeherListMobile({ rows }: { rows: Row[] }) {
  const t = useTranslations('AdminGassigeher')

  return (
    <div className="flex flex-col gap-3 sm:hidden" data-testid="gassigeher-list-mobile">
      {rows.map((r) => (
        <Link
          key={r.userId}
          href={`/admin/gassigeher/${r.userId}`}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 shrink-0 relative overflow-hidden flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-sm font-medium">
            {r.name?.[0] ?? '?'}
            {r.image && <Image src={r.image} alt="" fill className="object-cover" />}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{r.name ?? '—'}</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{r.email}</p>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {r.aufnahme && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                {t('aufgenommen')}
              </span>
            )}
            {r.kategorie && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${KATEGORIE_COLOR[r.kategorie]}`}
              >
                {t(`kategorie.${r.kategorie}`)}
              </span>
            )}
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                r.fileId
                  ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
              }`}
            >
              {r.fileId ? t('hasFile') : t('noFile')}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
