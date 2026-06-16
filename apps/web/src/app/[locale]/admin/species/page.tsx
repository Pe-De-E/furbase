import { db, species } from '@furbase/db'
import { asc } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { addSpecies, deleteSpecies } from './actions'

export default async function AdminSpeciesPage() {
  const [speciesList, t] = await Promise.all([
    db.select().from(species).orderBy(asc(species.sortOrder)),
    getTranslations('AdminSpecies'),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">{t('title')}</h1>
        <p className="text-zinc-500 text-sm mt-0.5">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current species */}
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-50">
            <p className="text-sm font-medium text-zinc-700">{t('currentSpecies')}</p>
          </div>
          <ul className="divide-y divide-zinc-50">
            {speciesList.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">{s.label}</p>
                  <p className="text-xs text-zinc-400 font-mono">{s.value}</p>
                </div>
                <form action={deleteSpecies.bind(null, s.id)}>
                  <button
                    type="submit"
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    {t('delete')}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>

        {/* Add species */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <p className="text-sm font-medium text-zinc-700 mb-4">{t('addSpecies')}</p>
          <form action={addSpecies} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">
                {t('fieldLabel')}{' '}
                <span className="text-zinc-400">{t('fieldLabelHint')}</span>
              </label>
              <input
                name="label"
                required
                placeholder={t('labelPlaceholder')}
                className="w-full text-sm rounded-xl border border-zinc-200 px-4 py-2.5 focus:outline-none focus:border-zinc-400"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">
                {t('fieldValue')}{' '}
                <span className="text-zinc-400">{t('fieldValueHint')}</span>
              </label>
              <input
                name="value"
                required
                placeholder={t('valuePlaceholder')}
                className="w-full text-sm rounded-xl border border-zinc-200 px-4 py-2.5 focus:outline-none focus:border-zinc-400 font-mono"
              />
            </div>
            <button
              type="submit"
              className="self-end px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors"
            >
              {t('addSpecies')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
