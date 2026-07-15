import { db, adoptionChecklistItem } from '@furbase/db'
import { asc } from 'drizzle-orm'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import ChecklistDragList from './checklist-drag-list'

export default async function AdminAdoptionPage() {
  const [items, t] = await Promise.all([
    db.select().from(adoptionChecklistItem).orderBy(asc(adoptionChecklistItem.sortOrder)),
    getTranslations('AdminAdoption'),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('title')}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">{t('total', { count: items.length })}</p>
        </div>
        <Link
          href="/admin/adoption/new"
          className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors"
        >
          {t('add')}
        </Link>
      </div>

      <ChecklistDragList items={items} />
    </div>
  )
}
