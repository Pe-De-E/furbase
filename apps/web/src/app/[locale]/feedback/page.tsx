import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Header from '@/components/header'
import { submitFeedback } from './actions'

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/api/auth/signin')

  const [t, { sent }] = await Promise.all([getTranslations('Feedback'), searchParams])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t('title')}</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">{t('subtitle')}</p>

        {sent && (
          <div className="mb-6 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-sm px-4 py-3">
            {t('success')}
          </div>
        )}

        <form action={submitFeedback} className="flex flex-col gap-4">
          <textarea
            name="message"
            required
            rows={6}
            placeholder={t('placeholder')}
            className="w-full text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-3 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 resize-none"
          />
          <button
            type="submit"
            className="self-end px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors"
          >
            {t('submit')}
          </button>
        </form>
      </main>
    </div>
  )
}
