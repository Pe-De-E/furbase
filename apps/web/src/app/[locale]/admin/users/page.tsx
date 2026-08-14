import { auth } from '@/auth'
import { db, user } from '@furbase/db'
import { asc } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { setUserRole } from './actions'

const envAdminEmails = () =>
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

export default async function AdminUsersPage() {
  const [session, rows, t] = await Promise.all([
    auth(),
    db
      .select({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt })
      .from(user)
      .orderBy(asc(user.name)),
    getTranslations('AdminUsers'),
  ])

  const envAdmins = new Set(envAdminEmails())

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('title')}</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">{t('stats', { count: rows.length })}</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <ul className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {rows.map((u) => {
            const isSelf = u.id === session?.user?.id
            const isEnvAdmin = envAdmins.has(u.email)

            return (
              <li key={u.id} className="flex items-center justify-between gap-4 px-5 py-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {u.name ?? '—'}
                    {isSelf && (
                      <span className="ml-2 text-xs font-normal text-zinc-400 dark:text-zinc-500">
                        {t('you')}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{u.email}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      u.role === 'admin'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {t(u.role === 'admin' ? 'roleAdmin' : 'roleUser')}
                  </span>

                  {isEnvAdmin ? (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500" title={t('envAdminHint')}>
                      {t('envAdmin')}
                    </span>
                  ) : isSelf ? null : (
                    <form action={setUserRole.bind(null, u.id, u.role === 'admin' ? 'user' : 'admin')}>
                      <button
                        type="submit"
                        className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      >
                        {t(u.role === 'admin' ? 'removeAdmin' : 'makeAdmin')}
                      </button>
                    </form>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
