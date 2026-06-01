import Link from 'next/link'
import type { InferSelectModel } from 'drizzle-orm'
import type { tier } from '@shelter-os/db'

type Animal = InferSelectModel<typeof tier>

const SPECIES_LABEL: Record<string, string> = {
  hund: 'Hund', katze: 'Katze', hase: 'Hase',
  vogel: 'Vogel', kleintier: 'Kleintier', sonstige: 'Sonstige',
}

const GENDER_LABEL: Record<string, string> = {
  maennlich: 'Männlich', weiblich: 'Weiblich', unbekannt: 'Unbekannt',
}

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  verfuegbar:         { label: 'Verfügbar',         className: 'bg-emerald-500' },
  reserviert:         { label: 'Reserviert',         className: 'bg-amber-400' },
  vermittelt:         { label: 'Vermittelt',         className: 'bg-zinc-400' },
  quarantaene:        { label: 'Quarantäne',         className: 'bg-red-500' },
  nicht_vermittelbar: { label: 'Nicht vermittelbar', className: 'bg-red-700' },
}

function formatAge(months: number | null): string {
  if (!months) return 'Alter unbekannt'
  if (months < 12) return `${months} ${months === 1 ? 'Monat' : 'Monate'}`
  const years = Math.floor(months / 12)
  return `${years} ${years === 1 ? 'Jahr' : 'Jahre'}`
}

export default function AnimalCard({ animal }: { animal: Animal }) {
  const image = animal.images?.[0] ?? `https://picsum.photos/seed/${animal.id}/600/400`
  const status = STATUS_STYLE[animal.status] ?? STATUS_STYLE.verfuegbar

  return (
    <Link
      href={`/tiere/${animal.id}`}
      className="group block rounded-2xl overflow-hidden bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
        <img
          src={image}
          alt={animal.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className={`absolute top-3 right-3 text-xs font-medium text-white px-2.5 py-1 rounded-full ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 leading-tight">{animal.name}</h2>
          {animal.isNeutered && (
            <span className="shrink-0 text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full mt-0.5">
              kastriert
            </span>
          )}
        </div>

        <p className="text-sm text-zinc-500 mt-0.5">
          {SPECIES_LABEL[animal.species] ?? animal.species}
          {animal.breed ? ` · ${animal.breed}` : ''}
        </p>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {animal.age != null && (
            <span className="text-xs bg-zinc-50 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full">
              {formatAge(animal.age)}
            </span>
          )}
          {animal.gender && (
            <span className="text-xs bg-zinc-50 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full">
              {GENDER_LABEL[animal.gender] ?? animal.gender}
            </span>
          )}
          {animal.size && (
            <span className="text-xs bg-zinc-50 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full capitalize">
              {animal.size}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
