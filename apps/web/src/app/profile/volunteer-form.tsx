'use client'

import { useTransition } from 'react'
import { saveVolunteerProfile } from './actions'
import type { InferSelectModel } from 'drizzle-orm'
import type { volunteerProfile } from '@shelter-os/db'

type VolunteerProfile = InferSelectModel<typeof volunteerProfile>

const OPTIONS = [
  {
    key: 'canFoster' as const,
    label: 'Foster care',
    description: 'Temporarily take in an animal at your home',
  },
  {
    key: 'canTransport' as const,
    label: 'Transport',
    description: 'Help transport animals to/from the shelter or vet',
  },
  {
    key: 'canWalkDogs' as const,
    label: 'Dog walking',
    description: 'Take dogs out for regular walks',
  },
  {
    key: 'canHelp' as const,
    label: 'General volunteering',
    description: 'Help at events, cleaning, feeding, etc.',
  },
]

export default function VolunteerForm({
  userId,
  initial,
}: {
  userId: string
  initial: VolunteerProfile | null
}) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => saveVolunteerProfile(userId, formData))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {OPTIONS.map(({ key, label, description }) => (
          <label
            key={key}
            className="flex items-start gap-4 p-4 rounded-xl border border-zinc-200 cursor-pointer hover:border-zinc-400 transition-colors has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-50"
          >
            <input
              type="checkbox"
              name={key}
              defaultChecked={initial?.[key] ?? false}
              className="mt-0.5 accent-zinc-900"
            />
            <div>
              <p className="text-sm font-medium text-zinc-800">{label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
            </div>
          </label>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Anything else you'd like to add?
        </label>
        <textarea
          name="notes"
          defaultValue={initial?.notes ?? ''}
          rows={3}
          placeholder="e.g. I can only help on weekends, I have a car..."
          className="w-full text-sm rounded-xl border border-zinc-200 px-4 py-3 resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-300"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="self-end px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
