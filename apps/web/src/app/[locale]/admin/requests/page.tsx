import { db, adoptionRequest, animal, user } from '@furbase/db'
import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { updateRequestStatus } from './actions'

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-600',
}

export default async function AdminRequestsPage() {
  const [rows, t] = await Promise.all([
    db
      .select({
        request: adoptionRequest,
        animal: { id: animal.id, name: animal.name, images: animal.images },
        user: { name: user.name, email: user.email, image: user.image },
      })
      .from(adoptionRequest)
      .innerJoin(animal, eq(adoptionRequest.animalId, animal.id))
      .innerJoin(user, eq(adoptionRequest.userId, user.id))
      .orderBy(adoptionRequest.createdAt),
    getTranslations('AdminRequests'),
  ])

  const pendingCount = rows.filter((r) => r.request.status === 'pending').length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('title')}</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
          {t('stats', { total: rows.length, pending: pendingCount })}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500">
          {t('empty')}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map(({ request: req, animal: a, user: u }) => (
            <div
              key={req.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5"
            >
              <div className="flex items-start gap-4 flex-wrap">
                {/* Animal */}
                <a
                  href={`/animals/${a.id}`}
                  className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={a.images?.[0] ?? `https://picsum.photos/seed/${a.id}/80/80`}
                    alt={a.name}
                    className="w-12 h-12 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800"
                  />
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{a.name}</p>
                </a>

                <div className="w-px self-stretch bg-zinc-100 dark:bg-zinc-800 hidden sm:block" />

                {/* User */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 shrink-0 relative overflow-hidden flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                    {u.name?.[0] ?? '?'}
                    {u.image && (
                      <img
                        src={u.image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {u.name ?? '—'}
                    </p>
                    <a
                      href={`mailto:${u.email}`}
                      className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      {u.email}
                    </a>
                  </div>
                </div>

                {/* Status + date */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[req.status]}`}
                  >
                    {t(`status.${req.status}` as Parameters<typeof t>[0])}
                  </span>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Message */}
              {req.message && (
                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-3">
                  {req.message}
                </p>
              )}

              {/* Actions */}
              {req.status === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <form
                    action={async () => {
                      'use server'
                      await updateRequestStatus(req.id, 'approved')
                    }}
                  >
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                      {t('approve')}
                    </button>
                  </form>
                  <form
                    action={async () => {
                      'use server'
                      await updateRequestStatus(req.id, 'rejected')
                    }}
                  >
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {t('reject')}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
