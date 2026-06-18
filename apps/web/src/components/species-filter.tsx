import { useTranslations } from 'next-intl'

type Species = { value: string; label: string }

export default function SpeciesFilter({
  species,
  active,
}: {
  species: Species[]
  active?: string
}) {
  const t = useTranslations('SpeciesFilter')
  const options = [{ value: '', label: t('all') }, ...species]

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = opt.value === '' ? !active : opt.value === active
        const href = opt.value ? `?species=${opt.value}` : '/'
        return (
          <a
            key={opt.value}
            href={href}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
            }`}
          >
            {opt.label}
          </a>
        )
      })}
    </div>
  )
}
