'use client'

import { useState } from 'react'

const ROLES = [
  { key: 'canFoster',    label: 'Foster care',         color: 'bg-purple-100 text-purple-700' },
  { key: 'canTransport', label: 'Transport',            color: 'bg-blue-100 text-blue-700' },
  { key: 'canWalkDogs',  label: 'Dog walking',          color: 'bg-emerald-100 text-emerald-700' },
  { key: 'canHelp',      label: 'General volunteering', color: 'bg-amber-100 text-amber-700' },
] as const

type Row = {
  volunteer: {
    id: string
    canFoster: boolean | null
    canTransport: boolean | null
    canWalkDogs: boolean | null
    canHelp: boolean | null
    notes: string | null
  }
  user: { name: string | null; email: string; image: string | null }
}

function VolunteerRow({ row: { volunteer: v, user: u } }: { row: Row }) {
  const [open, setOpen] = useState(false)
  const activeRoles = ROLES.filter(r => v[r.key])

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 p-4 text-left">
        <div className="w-10 h-10 rounded-full bg-zinc-200 relative overflow-hidden shrink-0 flex items-center justify-center text-zinc-500 text-sm font-medium">
          {u.name?.[0] ?? '?'}
          {u.image && <img src={u.image} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-zinc-900 truncate">{u.name ?? '—'}</p>
          <p className="text-xs text-zinc-400 truncate">{u.email}</p>
        </div>
        {activeRoles.length > 0 && (
          <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full shrink-0">
            {activeRoles.length} offer{activeRoles.length > 1 ? 's' : ''}
          </span>
        )}
        <span className="text-zinc-300 text-sm ml-1">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-zinc-100 px-4 py-4 flex flex-col gap-4">
          {activeRoles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeRoles.map(r => (
                <span key={r.key} className={`text-xs font-medium px-2.5 py-1 rounded-full ${r.color}`}>
                  {r.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No active offers</p>
          )}
          {v.notes && (
            <p className="text-sm text-zinc-500 bg-zinc-50 rounded-xl px-4 py-3">{v.notes}</p>
          )}
          <a href={`mailto:${u.email}`} className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors">
            Contact via email →
          </a>
        </div>
      )}
    </div>
  )
}

export default function VolunteerListMobile({ rows }: { rows: Row[] }) {
  return (
    <div className="flex flex-col gap-3 sm:hidden">
      {rows.map(row => <VolunteerRow key={row.volunteer.id} row={row} />)}
    </div>
  )
}
