'use client'

import { useTranslations } from 'next-intl'
import { deleteGassigeherFile } from './actions'
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog'

export default function DeleteFileButton({ fileId }: { fileId: string }) {
  const t = useTranslations('GassigeherForm')

  return (
    <ConfirmDeleteDialog
      trigger={t('deleteFile')}
      triggerClassName="px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
      title={t('deleteFileConfirm')}
      description={t('deleteFileWarning')}
      confirmLabel={t('deleteFile')}
      cancelLabel={t('cancel')}
      onConfirm={() => deleteGassigeherFile(fileId)}
    />
  )
}
