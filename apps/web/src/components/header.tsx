import Link from 'next/link'
import { auth, signIn, signOut } from '@/auth'

export default async function Header({ title }: { title?: string }) {
  const session = await auth()

  return (
    <header className="bg-white border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="text-base sm:text-lg font-semibold text-zinc-900 hover:text-zinc-600 transition-colors truncate">
          {title ?? 'Tierherberge Pfaffenhofen'}
        </Link>

        <div className="flex items-center gap-3 shrink-0">
          {session?.user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
                title="Your profile"
              >
                <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600 relative overflow-hidden shrink-0">
                  {(session.user.name ?? session.user.email ?? '?')[0].toUpperCase()}
                  {session.user.image && (
                    <img src={session.user.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                </div>
              </Link>
              <form action={async () => { 'use server'; await signOut() }}>
                <button className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <form action={async () => { 'use server'; await signIn('google') }}>
              <button className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors">
                Sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  )
}
