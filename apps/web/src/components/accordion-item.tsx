'use client'

import { useState } from 'react'

export default function AccordionItem({
  summary,
  details,
}: {
  summary: React.ReactNode
  details: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center gap-3">
          {summary}
          <span className="text-zinc-300 text-sm shrink-0">
            {open ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-zinc-100 px-4 py-4">{details}</div>
      )}
    </div>
  )
}
