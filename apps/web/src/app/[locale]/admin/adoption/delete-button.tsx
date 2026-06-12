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
      className="text-xs text-red-400 hover:text-red-600 transition-colors"
    >
      {t('delete')}
    </button>
  )
}
