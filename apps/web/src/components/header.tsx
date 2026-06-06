import Link from 'next/link'
import HeaderAuth from './header-auth'

export default function Header({ title }: { title?: string }) {
  return (
    <header className="bg-white border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-base sm:text-lg font-semibold text-zinc-900 hover:text-zinc-600 transition-colors truncate"
        >
          {title ?? 'Tierherberge Pfaffenhofen'}
        </Link>

        <HeaderAuth />
      </div>
    </header>
  )
}
