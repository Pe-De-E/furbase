import { db, feedback, user } from '@furbase/db'
import { desc, eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { resolveFeedback, deleteFeedback } from './actions'

const STATUS_STYLE: Record<string, string> = {
  new: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
}

export default async function AdminFeedbackPage() {
  const [rows, t] = await Promise.all([
    db
      .select({
        feedback: feedback,
        user: { name: user.name, email: user.email },
      })
      .from(feedback)
      .innerJoin(user, eq(feedback.userId, user.id))
      .orderBy(desc(feedback.createdAt)),
    getTranslations('AdminFeedback'),
  ])

  const newCount = rows.filter((r) => r.feedback.status === 'new').length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('title')}</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
          {t('stats', { total: rows.length, new: newCount })}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500">
          {t('empty')}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map(({ feedback: f, user: u }) => (
            <div
              key={f.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {u.name ?? '—'}
                  </p>
                  <a
                    href={`mailto:${u.email}`}
                    className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    {u.email}
                  </a>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[f.status]}`}
                  >
                    {t(`status.${f.status}` as Parameters<typeof t>[0])}
                  </span>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {new Date(f.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-3 whitespace-pre-wrap">
                {f.message}
              </p>

              <div className="flex gap-2 mt-4">
                {f.status === 'new' && (
                  <form action={resolveFeedback.bind(null, f.id)}>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                      {t('resolve')}
                    </button>
                  </form>
                )}
                <form action={deleteFeedback.bind(null, f.id)}>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {t('delete')}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
