import { db, volunteerProfile, user } from '@furbase/db'
import { eq } from 'drizzle-orm'
import VolunteerListMobile from './volunteer-list-mobile'

const ROLES = [
  { key: 'canFoster',    label: 'Foster care',          color: 'bg-purple-100 text-purple-700' },
  { key: 'canTransport', label: 'Transport',             color: 'bg-blue-100 text-blue-700' },
  { key: 'canWalkDogs',  label: 'Dog walking',           color: 'bg-emerald-100 text-emerald-700' },
  { key: 'canHelp',      label: 'General volunteering',  color: 'bg-amber-100 text-amber-700' },
] as const

export default async function AdminVolunteersPage() {
  const rows = await db
    .select({
      volunteer: volunteerProfile,
      user: { name: user.name, email: user.email, image: user.image },
    })
    .from(volunteerProfile)
    .innerJoin(user, eq(volunteerProfile.userId, user.id))
    .orderBy(volunteerProfile.updatedAt)

  const activeCount = rows.filter(r =>
    r.volunteer.canFoster || r.volunteer.canTransport ||
    r.volunteer.canWalkDogs || r.volunteer.canHelp
  ).length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Volunteers</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          {rows.length} registered · {activeCount} offering help
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-zinc-100 text-zinc-400">
          No volunteers registered yet.
        </div>
      ) : (
        <>
          <VolunteerListMobile rows={rows} />

          <div className="hidden sm:flex flex-col gap-4">
            {rows.map(({ volunteer: v, user: u }) => {
              const activeRoles = ROLES.filter(r => v[r.key])
              return (
                <div key={v.id} className="bg-white rounded-2xl border border-zinc-100 p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 shrink-0 relative overflow-hidden flex items-center justify-center text-zinc-500 text-sm font-medium">
                      {u.name?.[0] ?? '?'}
                      {u.image && <img src={u.image} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <p className="font-medium text-zinc-900">{u.name ?? '—'}</p>
                          <a href={`mailto:${u.email}`} className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                            {u.email}
                          </a>
                        </div>
                        {activeRoles.length === 0 && (
                          <span className="text-xs text-zinc-300">No active offers</span>
                        )}
                      </div>

                      {activeRoles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {activeRoles.map(r => (
                            <span key={r.key} className={`text-xs font-medium px-2.5 py-1 rounded-full ${r.color}`}>
                              {r.label}
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
