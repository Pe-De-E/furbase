import { db, volunteerProfile, user } from '@furbase/db'
import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import VolunteerListMobile from './volunteer-list-mobile'

const ROLE_KEYS = ['canFoster', 'canTransport', 'canWalkDogs', 'canHelp'] as const

const ROLE_COLOR: Record<string, string> = {
  canFoster: 'bg-purple-100 text-purple-700',
  canTransport: 'bg-blue-100 text-blue-700',
  canWalkDogs: 'bg-emerald-100 text-emerald-700',
  canHelp: 'bg-amber-100 text-amber-700',
}

export default async function AdminVolunteersPage() {
  const [rows, t] = await Promise.all([
    db
      .select({
        volunteer: volunteerProfile,
        user: { name: user.name, email: user.email, image: user.image },
      })
      .from(volunteerProfile)
      .innerJoin(user, eq(volunteerProfile.userId, user.id))
      .orderBy(volunteerProfile.updatedAt),
    getTranslations('AdminVolunteers'),
  ])

  const activeCount = rows.filter(
    (r) =>
      r.volunteer.canFoster ||
      r.volunteer.canTransport ||
      r.volunteer.canWalkDogs ||
      r.volunteer.canHelp,
  ).length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">{t('title')}</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          {t('stats', { total: rows.length, active: activeCount })}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-zinc-100 text-zinc-400">
          {t('empty')}
        </div>
      ) : (
        <>
          <VolunteerListMobile rows={rows} />

          <div className="hidden sm:flex flex-col gap-4">
            {rows.map(({ volunteer: v, user: u }) => {
              const activeRoles = ROLE_KEYS.filter((k) => v[k])
              return (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl border border-zinc-100 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 shrink-0 relative overflow-hidden flex items-center justify-center text-zinc-500 text-sm font-medium">
                      {u.name?.[0] ?? '?'}
                      {u.image && (
                        <img
                          src={u.image}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <p className="font-medium text-zinc-900">
                            {u.name ?? '—'}
                          </p>
                          <a
                            href={`mailto:${u.email}`}
                            className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                          >
                            {u.email}
                          </a>
                        </div>
                        {activeRoles.length === 0 && (
                          <span className="text-xs text-zinc-300">
                            {t('noActiveOffers')}
                          </span>
                        )}
                      </div>

                      {activeRoles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {activeRoles.map((k) => (
                            <span
                              key={k}
                              className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLOR[k]}`}
                            >
                              {t(`roles.${k}` as Parameters<typeof t>[0])}
                            </span>
                          ))}
                        </div>
                      )}

                      {v.notes && (
                        <p className="text-sm text-zinc-500 mt-3 bg-zinc-50 rounded-xl px-4 py-3">
                          {v.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
