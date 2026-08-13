import { getTranslations } from 'next-intl/server'
import FaqAccordion from './faq-accordion'

export default async function AdminFaqPage() {
  const t = await getTranslations('AdminFaq')
  const items = t.raw('items') as { question: string; answer: string }[]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('title')}</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">{t('subtitle')}</p>
      </div>

      <FaqAccordion items={items} />
    </div>
  )
}
