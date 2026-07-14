import { db, animal } from '@furbase/db'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { matchAnimals, type MatcherProfile } from '@/lib/matcher'
import AnimalCard from '@/components/animal-card'
import Header from '@/components/header'

export default async function MatcherResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const p = await searchParams

  const profile: MatcherProfile = {
    livingSituation:
      (p.living as MatcherProfile['livingSituation']) ?? 'apartment',
    hasKids: p.kids === 'true',
    hasOtherDogs: p.dogs === 'true',
    hasOtherCats: p.cats === 'true',
    activityLevel: (p.activity as MatcherProfile['activityLevel']) ?? 'medium',
    hoursAlone: (p.alone as MatcherProfile['hoursAlone']) ?? '2-4',
    experienceLevel:
      (p.experience as MatcherProfile['experienceLevel']) ?? 'beginner',
    preferredSpecies: p.species ? p.species.split(',').filter(Boolean) : [],
    preferredSize: (p.size as MatcherProfile['preferredSize']) ?? 'any',
  }

  const animals = await db
    .select()
    .from(animal)
    .where(eq(animal.status, 'available'))
  const results = matchAnimals(animals, profile)

  const compatible = results.filter((r) => r.isCompatible)
  const incompatible = results.filter((r) => !r.isCompatible)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/matcher"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            ← Redo questionnaire
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Your matches</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {compatible.length} compatible{' '}
            {compatible.length === 1 ? 'animal' : 'animals'} found
          </p>
        </div>

        {compatible.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <p className="text-zinc-400 dark:text-zinc-500 text-lg">
              No compatible animals found for your profile.
            </p>
            <Link
              href="/matcher"
              className="mt-4 inline-block text-sm text-zinc-900 dark:text-zinc-100 underline"
            >
              Try adjusting your answers
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {compatible.map(({ animal: a, score, reasons }) => (
              <div key={a.id} className="flex flex-col gap-2">
                <AnimalCard animal={a} />
                <div className="px-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, score)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {score} pts
                    </span>
                  </div>
                  {reasons.length > 0 && (
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                      {reasons.slice(0, 2).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {incompatible.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-zinc-400 dark:text-zinc-500 mb-4">
              Not compatible with your profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-40">
              {incompatible.map(({ animal: a, reasons }) => (
                <div key={a.id} className="flex flex-col gap-2">
                  <AnimalCard animal={a} />
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 px-1">{reasons[0]}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
