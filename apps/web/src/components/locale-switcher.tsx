'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export default function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function switchLocale() {
    const next = locale === 'de' ? 'en' : 'de'
    const query = Object.fromEntries(searchParams.entries())
    startTransition(() => {
      router.replace(
        { pathname, query: Object.keys(query).length ? query : undefined },
        { locale: next },
      )
    })
  }

  return (
    <button
      onClick={switchLocale}
      disabled={isPending}
      className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-50"
    >
      {locale === 'de' ? 'EN' : 'DE'}
    </button>
  )
}
