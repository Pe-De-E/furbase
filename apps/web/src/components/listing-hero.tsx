import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function ListingHero() {
  const t = useTranslations('ListingHero')

  return (
    <div className="mb-4">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{t('title')}</h1>
        <Link
          href="/matcher"
          className="shrink-0 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors"
        >
          {t('findMatch')}
        </Link>
      </div>
    </div>
  )
}
