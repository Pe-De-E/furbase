import { db, tier, settings } from '@shelter-os/db'
import { eq, and, type SQL } from 'drizzle-orm'
import AnimalCard from '@/components/animal-card'

const SPECIES_OPTIONS = [
  { value: '',          label: 'Alle' },
  { value: 'hund',      label: 'Hunde' },
  { value: 'katze',     label: 'Katzen' },
  { value: 'hase',      label: 'Hasen' },
  { value: 'vogel',     label: 'Vögel' },
  { value: 'kleintier', label: 'Kleintiere' },
  { value: 'sonstige',  label: 'Sonstige' },
]

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ art?: string }>
}) {
  const { art } = await searchParams

  const conditions: SQL[] = [eq(tier.status, 'verfuegbar')]
  if (art) conditions.push(eq(tier.species, art as Parameters<typeof eq>[1]))

  const [tiere, [config]] = await Promise.all([
    db.select().from(tier).where(and(...conditions)),
    db.select().from(settings).limit(1),
  ])

  const tierheimName = config?.name ?? 'Tierherberge'

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-zinc-900">{tierheimName}</span>
          <a href="/login" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            Anmelden
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Tiere suchen ein Zuhause</h1>
          <p className="text-zinc-500 mt-1">
            {tiere.length} {tiere.length === 1 ? 'Tier' : 'Tiere'} verfügbar
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {SPECIES_OPTIONS.map(opt => {
            const isActive = opt.value === '' ? !art : opt.value === art
            const href = opt.value ? `?art=${opt.value}` : '/'
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

        {tiere.length === 0 ? (
          <div className="text-center py-32 text-zinc-400">
            Keine Tiere in dieser Kategorie gefunden.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiere.map(t => (
              <AnimalCard key={t.id} animal={t} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
