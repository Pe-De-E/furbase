import { db, animal } from '@shelter-os/db'
import { desc } from 'drizzle-orm'
import Link from 'next/link'
import StatusSelect from './status-select'
import DeleteButton from './delete-button'

export default async function AdminAnimalsPage() {
  const animals = await db.select().from(animal).orderBy(desc(animal.createdAt))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Animals</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{animals.length} total</p>
        </div>
        <Link
          href="/admin/animals/new"
          className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors"
        >
          + Add animal
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Animal</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Species</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Status</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Arrival</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {animals.map(a => (
              <tr key={a.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={a.images?.[0] ?? `https://picsum.photos/seed/${a.id}/80/80`}
                      alt={a.name}
                      className="w-9 h-9 rounded-lg object-cover bg-zinc-100"
                    />
                    <div>
                      <p className="font-medium text-zinc-900">{a.name}</p>
                      <p className="text-xs text-zinc-400">{a.breed ?? '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 capitalize text-zinc-600">{a.species}</td>
                <td className="px-5 py-3">
                  <StatusSelect animalId={a.id} status={a.status} />
                </td>
                <td className="px-5 py-3 text-zinc-500">
                  {a.arrivalDate ?? '—'}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/animals/${a.id}`}
                      className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteButton animalId={a.id} name={a.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
