import { db, animal, species as speciesTable } from '@furbase/db'
import { eq, and, asc, desc, type SQL } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import StatusSelect from './status-select'
import DeleteButton from './delete-button'
import AnimalListMobile from './animal-list-mobile'
import SpeciesFilter from '@/components/species-filter'

export default async function AdminAnimalsPage({
  searchParams,
}: {
  searchParams: Promise<{ species?: string }>
}) {
  const { species } = await searchParams
  const t = await getTranslations('AdminAnimals')

  const conditions: SQL[] = []
  if (species) conditions.push(eq(animal.species, species))

  const [animals, speciesList] = await Promise.all([
    db
      .select()
      .from(animal)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(animal.createdAt)),
    db
      .select({ value: speciesTable.value, label: speciesTable.label })
      .from(speciesTable)
      .orderBy(asc(speciesTable.sortOrder)),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('title')}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">{t('total', { count: animals.length })}</p>
        </div>
        <Link
          href="/admin/animals/new"
          className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors"
        >
          {t('addAnimal')}
        </Link>
      </div>

      <div className="mb-6">
        <SpeciesFilter species={speciesList} active={species} />
      </div>

      <AnimalListMobile animals={animals} />

      <div
        className="hidden sm:block bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden overflow-x-auto"
        data-testid="animal-list-desktop"
      >
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-700">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                {t('colAnimal')}
              </th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                {t('colSpecies')}
              </th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                {t('colStatus')}
              </th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                {t('colArrival')}
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {animals.map((a) => (
              <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        a.images?.[0] ??
                        `https://picsum.photos/seed/${a.id}/80/80`
                      }
                      alt={a.name}
                      className="w-9 h-9 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-700"
                    />
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{a.name}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">{a.breed ?? '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 capitalize text-zinc-600 dark:text-zinc-300">
                  {a.species}
                </td>
                <td className="px-5 py-3">
                  <StatusSelect animalId={a.id} status={a.status} />
                </td>
                <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                  {a.arrivalDate ?? '—'}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/animals/${a.id}`}
                      className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      {t('edit')}
                    </Link>
                    <DeleteButton animalId={a.id} name={a.name} />
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
