import {
  db,
  adoptionChecklistItem,
  adoptionChecklistProgress,
} from '@furbase/db'
import { eq, asc } from 'drizzle-orm'
import { auth } from '@/auth'
import { getTranslations } from 'next-intl/server'
import Header from '@/components/header'
import Checklist from './checklist'

export default async function AdoptionPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()
  const userId = session?.user?.id

  const [items, progress, t] = await Promise.all([
    db
      .select()
      .from(adoptionChecklistItem)
      .orderBy(asc(adoptionChecklistItem.sortOrder)),
    userId
      ? db
          .select({ itemId: adoptionChecklistProgress.itemId })
          .from(adoptionChecklistProgress)
          .where(eq(adoptionChecklistProgress.userId, userId))
      : [],
    getTranslations('Adoption'),
  ])

  const checkedIds = new Set(progress.map((p) => p.itemId))
  const enriched = items.map((item) => ({
    id: item.id,
    text: locale === 'en' ? item.textEn : item.textDe,
    description: locale === 'en' ? item.descriptionEn : item.descriptionDe,
    checked: checkedIds.has(item.id),
  }))
  const done = enriched.filter((i) => i.checked).length

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t('title')}</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-2">{t('subtitle')}</p>

        {userId && (
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{
                  width: `${items.length ? (done / items.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400 shrink-0">
              {t('progress', { done, total: items.length })}
            </span>
          </div>
        )}

        <Checklist
          items={enriched}
          isLoggedIn={!!userId}
          loginHint={t('loginHint')}
        />
      </main>
    </div>
  )
}
