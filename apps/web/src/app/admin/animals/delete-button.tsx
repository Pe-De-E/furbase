'use client'

import { deleteAnimal } from '../actions'

export default function DeleteButton({ animalId, name }: { animalId: string; name: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm(`Delete ${name}?`)) deleteAnimal(animalId)
      }}
      className="text-xs text-red-400 hover:text-red-600 transition-colors"
    >
      Delete
    </button>
  )
}
