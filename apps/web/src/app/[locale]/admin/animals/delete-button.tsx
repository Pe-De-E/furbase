'use client'

import { deleteAnimal } from '../actions'

export default function DeleteButton({
  animalId,
  name,
  deleteConfirm,
  deleteLabel,
}: {
  animalId: string
  name: string
  deleteConfirm: string
  deleteLabel: string
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm(deleteConfirm)) deleteAnimal(animalId)
      }}
      className="text-xs text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
    >
      {deleteLabel}
    </button>
  )
}
