import { db, adoptionChecklistItem } from '@furbase/db'
import { asc } from 'drizzle-orm'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import DeleteButton from './delete-button'

export default async function AdminAdoptionPage() {
  const [items, t] = await Promise.all([
    db.select().from(adoptionChecklistItem).orderBy(asc(adoptionChecklistItem.sortOrder)),
    getTranslations('AdminAdoption'),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{t('title')}</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{t('total', { count: items.length })}</p>
        </div>
        <Link
          href="/admin/adoption/new"
          className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors"
        >
          {t('add')}
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-zinc-500 w-8">#</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">{t('fieldTextDe')}</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500 hidden sm:table-cell">{t('fieldTextEn')}</th>
              <th className="px-5 py-3 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-5 py-3 text-zinc-400">{item.sortOrder}</td>
                <td className="px-5 py-3 text-zinc-900">{item.textDe}</td>
                <td className="px-5 py-3 text-zinc-500 hidden sm:table-cell">{item.textEn}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/adoption/${item.id}`}
                      className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      {t('edit')}
                    </Link>
                    <DeleteButton id={item.id} text={item.textDe} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
