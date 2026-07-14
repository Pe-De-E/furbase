import { useTranslations } from 'next-intl'
import { saveChecklistItem } from './actions'
import Link from 'next/link'
import type { InferSelectModel } from 'drizzle-orm'
import type { adoptionChecklistItem } from '@furbase/db'

type Item = InferSelectModel<typeof adoptionChecklistItem>

const inputCls =
  'text-sm text-zinc-900 dark:text-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 bg-white dark:bg-zinc-800 placeholder:text-zinc-400 dark:placeholder:text-zinc-500'

export default function ChecklistItemForm({ item }: { item?: Item }) {
  const t = useTranslations('AdminAdoption')

  return (
    <form action={saveChecklistItem} className="flex flex-col gap-6 max-w-2xl">
      {item && <input type="hidden" name="id" value={item.id} />}

      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {item ? t('formTitleEdit') : t('formTitleNew')}
      </h1>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('fieldTextDe')}</label>
            <input name="textDe" required defaultValue={item?.textDe} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('fieldTextEn')}</label>
            <input name="textEn" required defaultValue={item?.textEn} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('fieldDescDe')}</label>
            <textarea name="descriptionDe" rows={2} defaultValue={item?.descriptionDe ?? ''} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('fieldDescEn')}</label>
            <textarea name="descriptionEn" rows={2} defaultValue={item?.descriptionEn ?? ''} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('fieldOrder')}</label>
            <input
              name="sortOrder"
              type="number"
              defaultValue={item?.sortOrder ?? 0}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors"
        >
          {t('save')}
        </button>
        <Link
          href="/admin/adoption"
          className="px-5 py-2.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          {t('cancel')}
        </Link>
      </div>
    </form>
  )
}
