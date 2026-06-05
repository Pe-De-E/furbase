import { db, settings, species as speciesTable } from '@furbase/db'
import { asc } from 'drizzle-orm'
import Header from '@/components/header'
import SpeciesFilter from '@/components/species-filter'
import ListingHero from '@/components/listing-hero'
import AnimalGrid from '@/components/animal-grid'
import { auth } from '@/auth'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ species?: string }>
}) {
  const { species } = await searchParams
  const session = await auth()
  const userId = session?.user?.id ?? null

  const [[config], speciesList] = await Promise.all([
    db.select().from(settings).limit(1),
    db
      .select({ value: speciesTable.value, label: speciesTable.label })
      .from(speciesTable)
      .orderBy(asc(speciesTable.sortOrder)),
  ])

  const shelterName = config?.name ?? 'Animal Shelter'

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header title={shelterName} />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <ListingHero />

        <div className="mb-8">
          <SpeciesFilter species={speciesList} active={species} />
        </div>

        <AnimalGrid species={species} userId={userId} />
      </main>
    </div>
  )
}
