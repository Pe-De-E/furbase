import { db, volunteerProfile, user, gassigeherFile } from '@furbase/db'
import { eq, and } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import GassigeherListMobile from './gassigeher-list-mobile'

const KATEGORIE_COLOR: Record<string, string> = {
  gruen: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
  gelb: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
  rot: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
}

export default async function AdminGassigeherPage() {
  const [rows, t] = await Promise.all([
    db
      .select({
        userId: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        grantedWalkDogs: volunteerProfile.grantedWalkDogs,
        fileId: gassigeherFile.id,
        contractImageUrl: gassigeherFile.contractImageUrl,
        kategorie: gassigeherFile.kategorie,
        aufnahme: gassigeherFile.aufnahme,
      })
      .from(volunteerProfile)
      .innerJoin(user, eq(volunteerProfile.userId, user.id))
      .leftJoin(gassigeherFile, eq(gassigeherFile.userId, user.id))
      .where(and(eq(volunteerProfile.canWalkDogs, true)))
      .orderBy(user.name),
    getTranslations('AdminGassigeher'),
  ])

  const withFileCount = rows.filter((r) => r.fileId).length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('title')}</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
          {t('stats', { total: rows.length, withFile: withFileCount })}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500">
          {t('empty')}
        </div>
      ) : (
        <>
          <GassigeherListMobile rows={rows} />

          <div className="hidden sm:flex flex-col gap-3" data-testid="gassigeher-list-desktop">
            {rows.map((r) => (
              <Link
                key={r.userId}
                href={`/admin/gassigeher/${r.userId}`}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 flex items-center gap-4 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 shrink-0 relative overflow-hidden flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                  {r.name?.[0] ?? '?'}
                  {r.image && <Image src={r.image} alt="" fill className="object-cover" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{r.name ?? '—'}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{r.email}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {r.aufnahme && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                      {t('aufgenommen')}
                    </span>
                  )}
                  {r.kategorie && (
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${KATEGORIE_COLOR[r.kategorie]}`}
                    >
                      {t(`kategorie.${r.kategorie}`)}
                    </span>
                  )}
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                      r.fileId
                        ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {r.fileId ? t('hasFile') : t('noFile')}
                  </span>
                  {r.fileId && !r.contractImageUrl && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                      {t('contractMissing')}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
