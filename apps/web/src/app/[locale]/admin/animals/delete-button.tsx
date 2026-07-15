'use client'

import { useTranslations } from 'next-intl'
import { deleteAnimal } from '../actions'
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog'

export default function DeleteButton({
  animalId,
  name,
}: {
  animalId: string
  name: string
}) {
  const t = useTranslations('AdminAnimals')

  return (
    <ConfirmDeleteDialog
      trigger={t('delete')}
      triggerClassName="text-xs text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
      title={t('deleteConfirm', { name })}
      description={t('deleteWarning')}
      confirmLabel={t('delete')}
      cancelLabel={t('cancel')}
      onConfirm={() => deleteAnimal(animalId)}
    />
  )
}
