'use client'

import { useTranslations } from 'next-intl'
import { deleteChecklistItem } from './actions'
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog'
import { buttonVariants } from '@/components/ui/button'

export default function DeleteButton({ id, text }: { id: string; text: string }) {
  const t = useTranslations('AdminAdoption')

  return (
    <ConfirmDeleteDialog
      trigger={t('delete')}
      triggerClassName={buttonVariants({ variant: 'destructive', size: 'xs' })}
      title={t('deleteConfirm', { text })}
      description={t('deleteWarning')}
      confirmLabel={t('delete')}
      cancelLabel={t('cancel')}
      onConfirm={() => deleteChecklistItem(id)}
    />
  )
}
