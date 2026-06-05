import { db, animal, favorite } from '@furbase/db'
import { eq, and, type SQL } from 'drizzle-orm'
import AnimalCard from './animal-card'
import FavoriteButton from './favorite-button'

type Props = {
  species?: string
  userId: string | null
}

export default async function AnimalGrid({ species, userId }: Props) {
  const conditions: SQL[] = [eq(animal.status, 'available')]
  if (species) conditions.push(eq(animal.species, species))

  const [animals, userFavorites] = await Promise.all([
    db.select().from(animal).where(and(...conditions)),
    userId
      ? db
          .select({ animalId: favorite.animalId })
          .from(favorite)
          .where(eq(favorite.userId, userId))
      : Promise.resolve([]),
  ])

  const favoritedIds = new Set(userFavorites.map((f) => f.animalId))

  if (animals.length === 0) {
    return (
      <div className="text-center py-32 text-zinc-400">
        No animals found in this category.
      </div>
    )
  }

  return (
    <>
      <p className="text-zinc-500 mb-8">
        {animals.length} {animals.length === 1 ? 'animal' : 'animals'} available
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {animals.map((a) => (
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
    </>
  )
}
