import Link from 'next/link'
import { auth, signIn, signOut } from '@/auth'

export default async function Header({ title }: { title?: string }) {
  const session = await auth()

  return (
    <header className="bg-white border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-zinc-900 hover:text-zinc-600 transition-colors">
          {title ?? 'Tierherberge Pfaffenhofen'}
        </Link>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Link href="/profile" className="flex items-center gap-2 text-sm text-zinc-700 hover:text-zinc-900 transition-colors">
                {session.user.image && (
                  <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />
                )}
                {session.user.name ?? session.user.email}
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
                Sign in with Google
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  )
}
