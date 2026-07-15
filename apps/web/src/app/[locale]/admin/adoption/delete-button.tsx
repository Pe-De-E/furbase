'use client'

import { useTranslations } from 'next-intl'
import { deleteChecklistItem } from './actions'
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog'

export default function DeleteButton({ id, text }: { id: string; text: string }) {
  const t = useTranslations('AdminAdoption')

  return (
    <ConfirmDeleteDialog
      trigger={t('delete')}
      triggerClassName="text-xs text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
      title={t('deleteConfirm', { text })}
      description={t('deleteWarning')}
      confirmLabel={t('delete')}
      cancelLabel={t('cancel')}
      onConfirm={() => deleteChecklistItem(id)}
    />
  )
}
