import { db, animal, settings, speciesEnum } from '@shelter-os/db'
import { eq, and, type SQL } from 'drizzle-orm'
import AnimalCard from '@/components/animal-card'

const SPECIES_OPTIONS = [
  { value: '',            label: 'All' },
  { value: 'dog',         label: 'Dogs' },
  { value: 'cat',         label: 'Cats' },
  { value: 'rabbit',      label: 'Rabbits' },
  { value: 'bird',        label: 'Birds' },
  { value: 'small_animal',label: 'Small Animals' },
  { value: 'other',       label: 'Other' },
]

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ species?: string }>
}) {
  const { species } = await searchParams

  const conditions: SQL[] = [eq(animal.status, 'available')]
  if (species) conditions.push(eq(animal.species, species as (typeof speciesEnum.enumValues)[number]))

  const [animals, [config]] = await Promise.all([
    db.select().from(animal).where(and(...conditions)),
    db.select().from(settings).limit(1),
  ])

  const shelterName = config?.name ?? 'Animal Shelter'

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-zinc-900">{shelterName}</span>
          <a href="/login" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            Sign in
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Animals looking for a home</h1>
          <p className="text-zinc-500 mt-1">
            {animals.length} {animals.length === 1 ? 'animal' : 'animals'} available
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {SPECIES_OPTIONS.map(opt => {
            const isActive = opt.value === '' ? !species : opt.value === species
            const href = opt.value ? `?species=${opt.value}` : '/'
            return (
              <a
                key={opt.value}
                href={href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {opt.label}
              </a>
            )
          })}
        </div>

        {animals.length === 0 ? (
          <div className="text-center py-32 text-zinc-400">
            No animals found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals.map(a => (
              <AnimalCard key={a.id} animal={a} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
