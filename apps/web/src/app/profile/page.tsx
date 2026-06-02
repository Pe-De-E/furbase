import { redirect } from 'next/navigation'
import { db, volunteerProfile, favorite, animal } from '@shelter-os/db'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import Header from '@/components/header'
import VolunteerForm from './volunteer-form'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect('/')

  const userId = session.user.id!

  const [volunteer, favorites] = await Promise.all([
    db.select().from(volunteerProfile).where(eq(volunteerProfile.userId, userId)).then(r => r[0] ?? null),
    db.select({ animal }).from(favorite)
      .innerJoin(animal, eq(favorite.animalId, animal.id))
      .where(eq(favorite.userId, userId)),
  ])

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-10">

        {/* Account */}
        <section className="bg-white rounded-2xl border border-zinc-100 p-6 flex items-center gap-5">
          {session.user.image && (
            <img src={session.user.image} alt="" className="w-16 h-16 rounded-full" />
          )}
          <div>
            <h1 className="text-xl font-bold text-zinc-900">{session.user.name}</h1>
            <p className="text-sm text-zinc-500">{session.user.email}</p>
          </div>
        </section>

        {/* Volunteer */}
        <section className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-1">How can you help?</h2>
          <p className="text-sm text-zinc-500 mb-6">
            Let us know how you'd like to support the shelter — we'll reach out when needed.
          </p>
          <VolunteerForm userId={userId} initial={volunteer} />
        </section>

        {/* Favorites */}
        <section className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Saved animals
            {favorites.length > 0 && (
              <span className="ml-2 text-sm font-normal text-zinc-400">{favorites.length}</span>
            )}
          </h2>
          {favorites.length === 0 ? (
            <div className="text-center py-10 text-zinc-400 text-sm">
              No saved animals yet.{' '}
              <a href="/" className="text-zinc-900 underline">Browse animals</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favorites.map(({ animal: a }) => (
                <a
                  key={a.id}
                  href={`/animals/${a.id}`}
                  className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3 hover:border-zinc-300 transition-colors"
                >
                  <img
                    src={a.images?.[0] ?? `https://picsum.photos/seed/${a.id}/80/80`}
                    alt={a.name}
                    className="w-12 h-12 rounded-lg object-cover bg-zinc-100"
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{a.name}</p>
                    <p className="text-xs text-zinc-400 capitalize">{a.species} · {a.breed ?? '—'}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Matcher */}
        <section className="bg-white rounded-2xl border border-zinc-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">Matching profile</h2>
              <p className="text-sm text-zinc-500 mt-0.5">Find animals that fit your lifestyle.</p>
            </div>
            <a
              href="/matcher"
              className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors"
            >
              {/* TODO: show "Redo" if profile exists */}
              Start questionnaire →
            </a>
          </div>
        </section>

      </main>
    </div>
  )
}
