import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import HeaderAuth from './header-auth'
import LocaleSwitcher from './locale-switcher'
import ThemeToggle from './theme-toggle'

export default async function Header({ title }: { title?: string }) {
  const t = await getTranslations('Header')

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors truncate"
        >
          {title ?? 'Tierherberge Pfaffenhofen'}
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/about"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors hidden sm:block"
          >
            {t('about')}
          </Link>
          <ThemeToggle />
          <LocaleSwitcher />
          <HeaderAuth />
        </div>
      </div>
    </header>
  )
}
