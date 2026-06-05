import Link from 'next/link'
import { auth, signIn, signOut } from '@/auth'
import UserMenu from './user-menu'

export default async function Header({ title }: { title?: string }) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'

  return (
    <header className="bg-white border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="text-base sm:text-lg font-semibold text-zinc-900 hover:text-zinc-600 transition-colors truncate">
          {title ?? 'Tierherberge Pfaffenhofen'}
        </Link>

        <div className="flex items-center gap-3 shrink-0">
          {session?.user ? (
            <UserMenu
              name={session.user.name}
              email={session.user.email}
              image={session.user.image}
              isAdmin={isAdmin}
              signOutAction={async () => { 'use server'; await signOut() }}
            />
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
