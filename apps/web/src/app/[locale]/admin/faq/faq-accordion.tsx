'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type FaqItem = {
  question: string
  answer: string
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-50 dark:divide-zinc-800 overflow-hidden">
      {items.map((item, i) => {
        const open = openIndex === i
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {item.question}
              </span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 text-zinc-400 dark:text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>
            {open && (
              <p className="px-5 pb-4 text-sm text-zinc-500 dark:text-zinc-400">{item.answer}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
