import { auth, signIn, signOut } from '@/auth'
import { getTranslations } from 'next-intl/server'
import UserMenu from './user-menu'

export default async function HeaderAuth() {
  const [session, t] = await Promise.all([auth(), getTranslations('Header')])

  if (!session?.user) {
    return (
      <form
        action={async () => {
          'use server'
          await signIn('google')
        }}
      >
        <button className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          {t('signIn')}
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
