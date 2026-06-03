import { db, animal, settings, speciesEnum, favorite } from '@furbase/db'
import { eq, and, type SQL } from 'drizzle-orm'
import AnimalCard from '@/components/animal-card'
import FavoriteButton from '@/components/favorite-button'
import Header from '@/components/header'
import SpeciesFilter from '@/components/species-filter'
import { auth } from '@/auth'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ species?: string }>
}) {
  const { species } = await searchParams

  const conditions: SQL[] = [eq(animal.status, 'available')]
  if (species) conditions.push(eq(animal.species, species as (typeof speciesEnum.enumValues)[number]))

  const session = await auth()
  const userId = session?.user?.id ?? null

  const [animals, [config], userFavorites] = await Promise.all([
    db.select().from(animal).where(and(...conditions)),
    db.select().from(settings).limit(1),
    userId
      ? db.select({ animalId: favorite.animalId }).from(favorite).where(eq(favorite.userId, userId))
      : Promise.resolve([]),
  ])

  const favoritedIds = new Set(userFavorites.map(f => f.animalId))
  const shelterName = config?.name ?? 'Animal Shelter'

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header title={shelterName} />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">Animals looking for a home</h1>
              <p className="text-zinc-500 mt-1">
                {animals.length} {animals.length === 1 ? 'animal' : 'animals'} available
              </p>
            </div>
            <a
              href="/matcher"
              className="shrink-0 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors"
            >
              Find my match →
            </a>
          </div>
        </div>

        <div className="mb-8">
          <SpeciesFilter active={species} />
        </div>

        {animals.length === 0 ? (
          <div className="text-center py-32 text-zinc-400">
            No animals found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals.map(a => (
              <AnimalCard
                key={a.id}
                animal={a}
                favoriteButton={
                  <FavoriteButton
                    userId={userId}
                    animalId={a.id}
                    isFavorited={favoritedIds.has(a.id)}
                  />
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
