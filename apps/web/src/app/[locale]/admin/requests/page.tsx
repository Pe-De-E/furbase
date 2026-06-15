import { db, adoptionRequest, animal, user } from '@furbase/db'
import { eq } from 'drizzle-orm'
import { updateRequestStatus } from './actions'

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-600',
}

export default async function AdminRequestsPage() {
  const rows = await db
    .select({
      request: adoptionRequest,
      animal: { id: animal.id, name: animal.name, images: animal.images },
      user: { name: user.name, email: user.email, image: user.image },
    })
    .from(adoptionRequest)
    .innerJoin(animal, eq(adoptionRequest.animalId, animal.id))
    .innerJoin(user, eq(adoptionRequest.userId, user.id))
    .orderBy(adoptionRequest.createdAt)

  const pendingCount = rows.filter((r) => r.request.status === 'pending').length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Adoption Requests</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          {rows.length} total · {pendingCount} pending
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-zinc-100 text-zinc-400">
          No adoption requests yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map(({ request: req, animal: a, user: u }) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-zinc-100 p-5"
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
                    className="w-12 h-12 rounded-lg object-cover bg-zinc-100"
                  />
                  <p className="text-sm font-semibold text-zinc-900">{a.name}</p>
                </a>

                <div className="w-px self-stretch bg-zinc-100 hidden sm:block" />

                {/* User */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
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
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {u.name ?? '—'}
                    </p>
                    <a
                      href={`mailto:${u.email}`}
                      className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
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
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                  <p className="text-xs text-zinc-400">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Message */}
              {req.message && (
                <p className="mt-4 text-sm text-zinc-600 bg-zinc-50 rounded-xl px-4 py-3">
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
                      Approve
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
                      className="px-4 py-2 text-sm font-medium rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
                    >
                      Reject
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
