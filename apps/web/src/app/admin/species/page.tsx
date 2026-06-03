import { db, species } from '@furbase/db'
import { asc } from 'drizzle-orm'
import { addSpecies, deleteSpecies } from './actions'

export default async function AdminSpeciesPage() {
  const speciesList = await db.select().from(species).orderBy(asc(species.sortOrder))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Species</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Manage animal species shown in filters and forms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Current species */}
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-50">
            <p className="text-sm font-medium text-zinc-700">Current species</p>
          </div>
          <ul className="divide-y divide-zinc-50">
            {speciesList.map(s => (
              <li key={s.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{s.label}</p>
                  <p className="text-xs text-zinc-400 font-mono">{s.value}</p>
                </div>
                <form action={deleteSpecies.bind(null, s.id)}>
                  <button
                    type="submit"
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>

        {/* Add species */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <p className="text-sm font-medium text-zinc-700 mb-4">Add species</p>
          <form action={addSpecies} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Label <span className="text-zinc-400">(displayed in UI)</span></label>
              <input
                name="label"
                required
                placeholder="e.g. Guinea Pigs"
                className="w-full text-sm rounded-xl border border-zinc-200 px-4 py-2.5 focus:outline-none focus:border-zinc-400"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Value <span className="text-zinc-400">(internal key, auto-formatted)</span></label>
              <input
                name="value"
                required
                placeholder="e.g. guinea_pig"
                className="w-full text-sm rounded-xl border border-zinc-200 px-4 py-2.5 focus:outline-none focus:border-zinc-400 font-mono"
              />
            </div>
            <button
              type="submit"
              className="self-end px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors"
            >
              Add species
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
