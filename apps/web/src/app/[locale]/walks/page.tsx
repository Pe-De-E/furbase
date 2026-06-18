import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db, walkSlot, volunteerProfile, user } from '@furbase/db'
import { and, eq, gte, lte } from 'drizzle-orm'
import Header from '@/components/header'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { signUpForSlot, cancelSlot } from './actions'

const PERIODS = ['morning', 'afternoon'] as const
type Period = (typeof PERIODS)[number]

function getMondayOfWeek(weekParam?: string): Date {
  const base = weekParam ? new Date(weekParam + 'T12:00:00Z') : new Date()
  const day = base.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(base)
  monday.setUTCDate(base.getUTCDate() + diff)
  return monday
}

function toDateStr(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setUTCDate(r.getUTCDate() + n)
  return r
}

export default async function WalksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ week?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/api/auth/signin')

  const userId = session.user.id
  const { locale } = await params
  const { week } = await searchParams

  const [volunteer, t] = await Promise.all([
    db
      .select({ id: volunteerProfile.id })
      .from(volunteerProfile)
      .where(eq(volunteerProfile.userId, userId))
      .then((r) => r[0] ?? null),
    getTranslations('Walks'),
  ])

  const isAdmin = session.user.role === 'admin'

  const monday = getMondayOfWeek(week)
  const sunday = addDays(monday, 6)
  const mondayStr = toDateStr(monday)
  const sundayStr = toDateStr(sunday)
  const prevMonday = toDateStr(addDays(monday, -7))
  const nextMonday = toDateStr(addDays(monday, 7))

  const slots = (volunteer || isAdmin)
    ? await db
        .select({
          id: walkSlot.id,
          date: walkSlot.date,
          period: walkSlot.period,
          userId: walkSlot.userId,
          name: user.name,
        })
        .from(walkSlot)
        .innerJoin(user, eq(walkSlot.userId, user.id))
        .where(and(gte(walkSlot.date, mondayStr), lte(walkSlot.date, sundayStr)))
    : []

  const grid: Record<string, Record<Period, typeof slots>> = {}
  for (let i = 0; i < 7; i++) {
    const d = toDateStr(addDays(monday, i))
    grid[d] = { morning: [], afternoon: [] }
  }
  for (const slot of slots) {
    if (grid[slot.date]) {
      grid[slot.date][slot.period as Period].push(slot)
    }
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  const uiLocale = locale === 'de' ? 'de-DE' : 'en-GB'

  const rangeFmt = new Intl.DateTimeFormat(uiLocale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

  const rangeLabel = `${rangeFmt.format(monday)} – ${rangeFmt.format(sunday)}`

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          {t('title')}
        </h1>

        {!volunteer && !isAdmin ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-10 text-center">
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">{t('notVolunteer')}</p>
            <Link
              href="/profile"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-2"
            >
              {t('registerLink')}
            </Link>
          </div>
        ) : (
          <>
            {/* Week navigation */}
            <div className="flex items-center justify-between mb-4">
              <Link
                href={`/walks?week=${prevMonday}`}
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                {t('prevWeek')}
              </Link>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {rangeLabel}
              </span>
              <Link
                href={`/walks?week=${nextMonday}`}
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                {t('nextWeek')}
              </Link>
            </div>

            {/* Grid */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="w-28 px-4 py-3" />
                    {days.map((day, i) => {
                      const dayNum = day.getUTCDate()
                      const weekday = day.toLocaleDateString(uiLocale, {
                        weekday: 'short',
                        timeZone: 'UTC',
                      })
                      const isToday = toDateStr(day) === toDateStr(new Date())
                      return (
                        <th
                          key={i}
                          className="px-3 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide"
                        >
                          <div>{weekday}</div>
                          <div
                            className={`text-base font-bold normal-case tracking-normal mt-0.5 ${
                              isToday
                                ? 'w-7 h-7 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center mx-auto'
                                : 'text-zinc-900 dark:text-zinc-100'
                            }`}
                          >
                            {dayNum}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map((period, pi) => (
                    <tr
                      key={period}
                      className={
                        pi < PERIODS.length - 1
                          ? 'border-b border-zinc-100 dark:border-zinc-800'
                          : ''
                      }
                    >
                      <td className="px-4 py-4 text-sm font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap align-top">
                        {period === 'morning' ? t('morning') : t('afternoon')}
                      </td>
                      {days.map((day, i) => {
                        const dateStr = toDateStr(day)
                        const cellSlots = grid[dateStr][period]
                        const mySlot = cellSlots.find((s) => s.userId === userId)
                        const others = cellSlots.filter((s) => s.userId !== userId)

                        return (
                          <td
                            key={i}
                            className="px-3 py-4 align-top border-l border-zinc-100 dark:border-zinc-800"
                          >
                            <div className="flex flex-col gap-1.5 min-h-[3.5rem]">
                              {others.map((s) => (
                                <span
                                  key={s.id}
                                  className="text-xs text-zinc-600 dark:text-zinc-400"
                                >
                                  {s.name?.split(' ')[0] ?? '—'}
                                </span>
                              ))}

                              {mySlot ? (
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                    {session.user.name?.split(' ')[0]} ✓
                                  </span>
                                  <form
                                    action={cancelSlot.bind(null, mySlot.id)}
                                    className="contents"
                                  >
                                    <button
                                      type="submit"
                                      className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors text-left"
                                    >
                                      {t('cancel')}
                                    </button>
                                  </form>
                                </div>
                              ) : (
                                <form
                                  action={signUpForSlot.bind(null, dateStr, period)}
                                  className="contents"
                                >
                                  <button
                                    type="submit"
                                    className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-left"
                                  >
                                    + {t('signUp')}
                                  </button>
                                </form>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
