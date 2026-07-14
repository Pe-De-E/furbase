'use client'

import { useTranslations } from 'next-intl'
import { deleteChecklistItem } from './actions'

export default function DeleteButton({ id, text }: { id: string; text: string }) {
  const t = useTranslations('AdminAdoption')

  return (
    <button
      type="button"
      onClick={() => {
        if (confirm(t('deleteConfirm', { text }))) deleteChecklistItem(id)
      }}
      className="text-xs text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
    >
      {t('delete')}
    </button>
  )
}
