import { auth, signIn, signOut } from '@/auth'
import UserMenu from './user-menu'

export default async function HeaderAuth() {
  const session = await auth()

  if (!session?.user) {
    return (
      <form
        action={async () => {
          'use server'
          await signIn('google')
        }}
      >
        <button className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors">
          Sign in
        </button>
      </form>
    )
  }

  return (
    <UserMenu
      name={session.user.name}
      email={session.user.email}
      image={session.user.image}
      isAdmin={session.user.role === 'admin'}
      signOutAction={async () => {
        'use server'
        await signOut()
      }}
    />
  )
}
