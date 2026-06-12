'use client'

import { useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { toggleChecklistItem } from './actions'

type Item = {
  id: string
  text: string
  description: string | null
  checked: boolean
}

export default function Checklist({
  items,
  isLoggedIn,
  loginHint,
}: {
  items: Item[]
  isLoggedIn: boolean
  loginHint: string
}) {
  const [isPending, startTransition] = useTransition()

  function toggle(itemId: string, checked: boolean) {
    if (!isLoggedIn) {
      signIn('google')
      return
    }
    startTransition(() => toggleChecklistItem(itemId, checked))
  }

  return (
    <>
      {!isLoggedIn && (
        <button
          onClick={() => signIn('google')}
          className="block w-full text-left mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 hover:border-emerald-300 transition-colors"
        >
          {loginHint}
        </button>
      )}
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id}>
            <label
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-colors ${
                item.checked
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-white border-zinc-100 hover:border-zinc-300'
              } ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => toggle(item.id, e.target.checked)}
                className="mt-0.5 w-4 h-4 shrink-0 accent-emerald-600"
              />
              <div>
                <p
                  className={`text-sm font-medium ${
                    item.checked
                      ? 'text-emerald-800 line-through'
                      : 'text-zinc-900'
                  }`}
                >
                  {item.text}
                </p>
                {item.description && (
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
            </label>
          </li>
        ))}
      </ul>
    </>
  )
}
