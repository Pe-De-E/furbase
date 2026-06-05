import Link from 'next/link'

export default function ListingHero() {
  return (
    <div className="mb-4">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold text-zinc-900">
          Animals looking for a home
        </h1>
        <Link
          href="/matcher"
          className="shrink-0 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors"
        >
          Find my match →
        </Link>
      </div>
    </div>
  )
}
