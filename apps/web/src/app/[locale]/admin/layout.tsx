import { auth } from '@/auth'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, t] = await Promise.all([auth(), getTranslations('AdminLayout')])

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-zinc-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-y-2">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <Link
              href="/"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {t('backToSite')}
            </Link>
            <span className="text-zinc-600 hidden sm:inline">|</span>
            <Link
              href="/admin/animals"
              className="text-sm font-medium hover:text-zinc-300 transition-colors"
            >
              {t('animals')}
            </Link>
            <Link
              href="/admin/volunteers"
              className="text-sm font-medium hover:text-zinc-300 transition-colors"
            >
              {t('volunteers')}
            </Link>
            <Link
              href="/admin/species"
              className="text-sm font-medium hover:text-zinc-300 transition-colors"
            >
              {t('species')}
            </Link>
            <Link
              href="/admin/adoption"
              className="text-sm font-medium hover:text-zinc-300 transition-colors"
            >
              {t('adoption')}
            </Link>
            <Link
              href="/admin/requests"
              className="text-sm font-medium hover:text-zinc-300 transition-colors"
            >
              {t('requests')}
            </Link>
          </div>
          <span className="text-xs text-zinc-500 hidden sm:inline">
            Admin — {session?.user?.email}
          </span>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-10">{children}</div>
    </div>
  )
}
