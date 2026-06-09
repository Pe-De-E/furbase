'use client'

import { useTransition, useState } from 'react'
import { toggleFavorite } from '@/app/[locale]/actions'

export default function FavoriteButton({
  userId,
  animalId,
  isFavorited: initial,
}: {
  userId: string | null
  animalId: string
  isFavorited: boolean
}) {
  const [isFavorited, setIsFavorited] = useState(initial)
  const [isPending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    if (!userId) {
      window.location.href = '/api/auth/signin'
      return
    }
    const next = !isFavorited
    setIsFavorited(next)
    startTransition(() => toggleFavorite(userId, animalId, isFavorited))
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`p-2 rounded-full transition-all ${
        isFavorited
          ? 'bg-red-500 text-white'
          : 'bg-white/80 backdrop-blur-sm text-zinc-400 hover:text-red-500'
      }`}
      title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  )
}
