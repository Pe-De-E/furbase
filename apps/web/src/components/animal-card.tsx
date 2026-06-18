import Link from 'next/link'
import Image from 'next/image'
import type { InferSelectModel } from 'drizzle-orm'
import type { animal } from '@furbase/db'
import { useTranslations } from 'next-intl'

type Animal = InferSelectModel<typeof animal>

const STATUS_CLASS: Record<string, string> = {
  available: 'bg-emerald-500',
  reserved: 'bg-amber-400',
  adopted: 'bg-zinc-400',
  quarantine: 'bg-red-500',
  not_adoptable: 'bg-red-700',
}

export default function AnimalCard({
  animal,
  favoriteButton,
}: {
  animal: Animal
  favoriteButton?: React.ReactNode
}) {
  const t = useTranslations('AnimalCard')
  const image =
    animal.images?.[0] ?? `https://picsum.photos/seed/${animal.id}/600/400`
  const statusClass = STATUS_CLASS[animal.status] ?? STATUS_CLASS.available

  function formatAge(months: number | null): string {
    if (!months) return t('ageUnknown')
    if (months < 12) return t('ageMonths', { months })
    const years = Math.floor(months / 12)
    return t('ageYears', { years })
  }

  return (
    <Link
      href={`/animals/${animal.id}`}
      className="group block rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={image}
          alt={animal.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span
          className={`absolute top-3 left-3 text-xs font-medium text-white px-2.5 py-1 rounded-full ${statusClass}`}
        >
          {t(`status.${animal.status}` as Parameters<typeof t>[0])}
        </span>
        {favoriteButton && (
          <div className="absolute top-3 right-3">{favoriteButton}</div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
            {animal.name}
          </h2>
          {animal.isNeutered && (
            <span className="shrink-0 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full mt-0.5">
              {t('neutered')}
            </span>
          )}
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {t(`species.${animal.species}` as Parameters<typeof t>[0])}
          {animal.breed ? ` · ${animal.breed}` : ''}
        </p>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {animal.age != null && (
            <span className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-full">
              {formatAge(animal.age)}
            </span>
          )}
          {animal.gender && (
            <span className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-full">
              {t(`gender.${animal.gender}` as Parameters<typeof t>[0])}
            </span>
          )}
          {animal.size && (
            <span className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-full capitalize">
              {animal.size}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
