import { db, animal, animalTag, tag, adoptionRequest } from '@furbase/db'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'
import { auth } from '@/auth'
import RequestButton from './request-button'

const SPECIES_LABEL: Record<string, string> = {
  dog: 'Dog',
  cat: 'Cat',
  rabbit: 'Rabbit',
  bird: 'Bird',
  small_animal: 'Small Animal',
  other: 'Other',
}

const GENDER_LABEL: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  unknown: 'Unknown',
}

const SIZE_LABEL: Record<string, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
}

const ACTIVITY_LABEL: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  available: {
    label: 'Available',
    className: 'bg-emerald-100 text-emerald-700',
  },
  reserved: { label: 'Reserved', className: 'bg-amber-100 text-amber-700' },
  adopted: { label: 'Adopted', className: 'bg-zinc-100 text-zinc-500' },
  quarantine: { label: 'Quarantine', className: 'bg-red-100 text-red-700' },
  not_adoptable: {
    label: 'Not adoptable',
    className: 'bg-red-100 text-red-700',
  },
}

function formatAge(months: number | null): string {
  if (!months) return 'Unknown'
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'}`
  const years = Math.floor(months / 12)
  const remaining = months % 12
  if (remaining === 0) return `${years} ${years === 1 ? 'year' : 'years'}`
  return `${years}y ${remaining}m`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Unknown'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function AnimalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user?.id ?? null

  const [row] = await db.select().from(animal).where(eq(animal.id, id))
  if (!row) notFound()

  const [existingRequest, tagRows] = await Promise.all([
    userId
      ? db
          .select({ id: adoptionRequest.id })
          .from(adoptionRequest)
          .where(and(eq(adoptionRequest.userId, userId), eq(adoptionRequest.animalId, id)))
          .then((r) => r[0] ?? null)
      : Promise.resolve(null),
    db
      .select({ name: tag.name, category: tag.category })
      .from(animalTag)
      .innerJoin(tag, eq(animalTag.tagId, tag.id))
      .where(eq(animalTag.animalId, id)),
  ])

  const images = row.images?.length
    ? row.images
    : [`https://picsum.photos/seed/${row.id}/800/600`]
  const status = STATUS_STYLE[row.status] ?? STATUS_STYLE.available

  const compatibilityItems = [
    { label: 'Kids', value: row.goodWithKids },
    { label: 'Dogs', value: row.goodWithDogs },
    { label: 'Cats', value: row.goodWithCats },
  ]

  const needsItems = [
    { label: 'Garden', value: row.needsGarden },
    { label: 'Experienced owner', value: row.needsExperiencedOwner },
    { label: 'Training', value: row.needsTraining },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-8"
        >
          ← Back to all animals
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div className="flex flex-col gap-3">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <img
                src={images[0]}
                alt={row.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {images.slice(1).map((src, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800"
                  >
                    <img
                      src={src}
                      alt={`${row.name} ${i + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{row.name}</h1>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}
                >
                  {status.label}
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400">
                {SPECIES_LABEL[row.species] ?? row.species}
                {row.breed ? ` · ${row.breed}` : ''}
                {row.breedSuspected
                  ? ` (suspected: ${row.breedSuspected})`
                  : ''}
              </p>
            </div>

            {row.description && (
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{row.description}</p>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Age', value: formatAge(row.age) },
                {
                  label: 'Gender',
                  value: row.gender ? GENDER_LABEL[row.gender] : '—',
                },
                { label: 'Size', value: row.size ? SIZE_LABEL[row.size] : '—' },
                {
                  label: 'Weight',
                  value: row.weight ? `${row.weight} kg` : '—',
                },
                { label: 'Color', value: row.color ?? '—' },
                {
                  label: 'Activity',
                  value: row.activityLevel
                    ? ACTIVITY_LABEL[row.activityLevel]
                    : '—',
                },
                { label: 'Arrival', value: formatDate(row.arrivalDate) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 px-4 py-3"
                >
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Health */}
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-2">
                Health
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Neutered', value: row.isNeutered },
                  { label: 'Vaccinated', value: row.isVaccinated },
                  { label: 'Chipped', value: row.isChipped },
                ].map(({ label, value }) => (
                  <span
                    key={label}
                    className={`text-xs px-3 py-1 rounded-full border font-medium ${
                      value
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    {value ? '✓' : '✗'} {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Compatibility */}
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-2">
                Good with
              </p>
              <div className="flex flex-wrap gap-2">
                {compatibilityItems.map(({ label, value }) => (
                  <span
                    key={label}
                    className={`text-xs px-3 py-1 rounded-full border font-medium ${
                      value === true
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : value === false
                          ? 'bg-red-50 border-red-200 text-red-600'
                          : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    {value === true ? '✓' : value === false ? '✗' : '?'} {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Needs */}
            {needsItems.some((n) => n.value) && (
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-2">
                  Needs
                </p>
                <div className="flex flex-wrap gap-2">
                  {needsItems
                    .filter((n) => n.value)
                    .map(({ label }) => (
                      <span
                        key={label}
                        className="text-xs px-3 py-1 rounded-full border bg-amber-50 border-amber-200 text-amber-700 font-medium"
                      >
                        {label}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {tagRows.length > 0 && (
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-2">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {tagRows.map((t) => (
                    <span
                      key={t.name}
                      className="text-xs px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {row.status === 'available' && (
              <RequestButton
                animalId={row.id}
                animalName={row.name}
                isLoggedIn={!!userId}
                hasExistingRequest={!!existingRequest}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
