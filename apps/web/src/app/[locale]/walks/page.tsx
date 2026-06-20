import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db, walkSlot, volunteerProfile, user, animal } from '@furbase/db'
import { and, eq, gte, lte } from 'drizzle-orm'
import Header from '@/components/header'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { signUpForSlot, cancelSlot } from './actions'

type Period = 'morning' | 'afternoon'


interface SlotInfo {
  volunteerId: string
  volunteerName: string | null
  slotId: string
}

interface GridCell {
  morning: SlotInfo[]
  afternoon: SlotInfo[]
}

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
  searchParams: Promise<{ week?: string; day?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/api/auth/signin')

  const userId = session.user.id
  const { locale } = await params
  const { week, day: dayParam } = await searchParams

  const [volunteer, t] = await Promise.all([
    db
      .select({ id: volunteerProfile.id, approved: volunteerProfile.approved })
      .from(volunteerProfile)
      .where(eq(volunteerProfile.userId, userId))
      .then((r) => r[0] ?? null),
    getTranslations('Walks'),
  ])

  const isApprovedVolunteer = volunteer?.approved === true

  const monday = getMondayOfWeek(week)
  const sunday = addDays(monday, 6)
  const mondayStr = toDateStr(monday)
  const sundayStr = toDateStr(sunday)
  const prevMonday = toDateStr(addDays(monday, -7))
  const nextMonday = toDateStr(addDays(monday, 7))

  const todayStr = toDateStr(new Date())
  const uiLocale = locale === 'de' ? 'de-DE' : 'en-GB'
  const amLabel = locale === 'de' ? 'V' : 'AM'
  const pmLabel = locale === 'de' ? 'N' : 'PM'

  // Mobile: single-day view
  const mobileDay = dayParam
    ? new Date(dayParam + 'T12:00:00Z')
    : (toDateStr(new Date()) >= mondayStr && toDateStr(new Date()) <= sundayStr)
      ? new Date()
      : monday
  const mobileDayStr = toDateStr(mobileDay)
  const prevMobileDay = addDays(mobileDay, -1)
  const nextMobileDay = addDays(mobileDay, 1)
  const mobileDayLabel = new Intl.DateTimeFormat(uiLocale, {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
  }).format(mobileDay)

  const [animals, slots] =
    isApprovedVolunteer
      ? await Promise.all([
          db
            .select({ id: animal.id, name: animal.name })
            .from(animal)
            .orderBy(animal.name),
          db
            .select({
              id: walkSlot.id,
              date: walkSlot.date,
              period: walkSlot.period,
              userId: walkSlot.userId,
              userName: user.name,
              animalId: walkSlot.animalId,
            })
            .from(walkSlot)
            .innerJoin(user, eq(walkSlot.userId, user.id))
            .where(
              and(gte(walkSlot.date, mondayStr), lte(walkSlot.date, sundayStr)),
            ),
        ])
      : [[], []]

  // Build grid: grid[animalId][dateStr] = { morning: [...], afternoon: [...] }
  const grid: Record<string, Record<string, GridCell>> = {}
  for (const a of animals) {
    grid[a.id] = {}
    for (let i = 0; i < 7; i++) {
      const d = toDateStr(addDays(monday, i))
      grid[a.id][d] = { morning: [], afternoon: [] }
    }
  }
  for (const slot of slots) {
    if (grid[slot.animalId]?.[slot.date]) {
      grid[slot.animalId][slot.date][slot.period as Period].push({
        volunteerId: slot.userId,
        volunteerName: slot.userName,
        slotId: slot.id,
      })
    }
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

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

        {!volunteer ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-10 text-center">
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              {t('notVolunteer')}
            </p>
            <Link
              href="/profile"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-2"
            >
              {t('registerLink')}
            </Link>
          </div>
        ) : !isApprovedVolunteer ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-10 text-center">
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              {t('pendingApproval')}
            </p>
            <Link
              href="/profile"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-2"
            >
              {t('registerLink')}
            </Link>
          </div>
        ) : (
          <>
            {/* Week navigation — desktop only */}
            <div className="hidden sm:flex items-center justify-between mb-4">
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

            {/* Day navigation — mobile only */}
            <div className="flex sm:hidden items-center justify-between mb-4">
              <Link
                href={`/walks?week=${toDateStr(getMondayOfWeek(toDateStr(prevMobileDay)))}&day=${toDateStr(prevMobileDay)}`}
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-2 py-1"
              >
                ←
              </Link>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 capitalize">
                {mobileDayLabel}
              </span>
              <Link
                href={`/walks?week=${toDateStr(getMondayOfWeek(toDateStr(nextMobileDay)))}&day=${toDateStr(nextMobileDay)}`}
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-2 py-1"
              >
                →
              </Link>
            </div>

            {/* Grid */}
            {/* Mobile: single-day card view */}
            <div className="sm:hidden bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
              {animals.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {t('noAnimals')}
                </p>
              ) : (
                animals.map((a) => (
                  <div key={a.id} className="px-4 py-3">
                    <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                      {a.name}
                    </div>
                    {(['morning', 'afternoon'] as Period[]).map((period) => {
                      const cellData = grid[a.id]?.[mobileDayStr]?.[period] ?? []
                      const mySlot = cellData.find((s) => s.volunteerId === userId)
                      const others = cellData.filter((s) => s.volunteerId !== userId)
                      return (
                        <div key={period} className="flex items-start gap-3 mb-1.5">
                          <span className="text-[10px] font-medium text-zinc-300 dark:text-zinc-600 w-4 pt-0.5">
                            {period === 'morning' ? amLabel : pmLabel}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 flex-1">
                            {others.map((slot) => (
                              <span key={slot.slotId} className="text-xs text-zinc-500 dark:text-zinc-400">
                                {slot.volunteerName?.split(' ')[0] ?? '—'}
                              </span>
                            ))}
                            {mySlot ? (
                              <>
                                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                  {session.user.name?.split(' ')[0]}
                                </span>
                                <form action={cancelSlot.bind(null, mySlot.slotId)} className="contents">
                                  <button
                                    type="submit"
                                    className="text-xs px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                  >
                                    {t('cancel')}
                                  </button>
                                </form>
                              </>
                            ) : (
                              <form action={signUpForSlot.bind(null, mobileDayStr, period, a.id)} className="contents">
                                <button
                                  type="submit"
                                  className="text-xs px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:hover:border-zinc-500 dark:hover:text-zinc-300 transition-colors"
                                >
                                  +
                                </button>
                              </form>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Desktop: full-week table */}
            <div className="hidden sm:block bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="w-14 sm:w-16 px-2 py-2" />
                    {animals.map((a) => (
                      <th
                        key={a.id}
                        className="px-1 py-2 text-center text-xs font-semibold text-zinc-700 dark:text-zinc-300 min-w-[4rem]"
                      >
                        {a.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {animals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={animals.length + 1}
                        className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
                      >
                        {t('noAnimals')}
                      </td>
                    </tr>
                  ) : (
                    days.flatMap((day) => {
                      const dateStr = toDateStr(day)
                      const isToday = dateStr === todayStr
                      const weekday = day.toLocaleDateString(uiLocale, {
                        weekday: 'short',
                        timeZone: 'UTC',
                      })
                      return (['morning', 'afternoon'] as Period[]).map((period) => {
                        const isMorning = period === 'morning'
                        return (
                          <tr
                            key={`${dateStr}-${period}`}
                            className={isMorning ? 'border-t-2 border-zinc-300 dark:border-zinc-400' : 'border-t border-zinc-100 dark:border-zinc-800 border-b-2 border-zinc-300 dark:border-zinc-400'}
                          >
                            {/* Label cell */}
                            <td className="px-2 py-1.5 text-center align-middle whitespace-nowrap w-14 sm:w-16">
                              {isMorning && (
                                <div className={`text-xs font-bold mb-0.5 ${isToday ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                  {weekday} {day.getUTCDate()}
                                </div>
                              )}
                              <div className="text-[10px] font-medium text-zinc-300 dark:text-zinc-600">
                                {isMorning ? amLabel : pmLabel}
                              </div>
                            </td>

                            {/* One cell per animal */}
                            {animals.map((animal) => {
                              const cellData = grid[animal.id]?.[dateStr]?.[period] ?? []
                              const mySlot = cellData.find((s) => s.volunteerId === userId)
                              const others = cellData.filter((s) => s.volunteerId !== userId)
                              return (
                                <td
                                  key={animal.id}
                                  className="border-l border-zinc-100 dark:border-zinc-800 px-1 py-1.5 align-top"
                                >
                                  <div className="flex flex-col gap-0.5 min-h-[1.75rem]">
                                    {others.map((slot) => (
                                      <span
                                        key={slot.slotId}
                                        className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight"
                                      >
                                        {slot.volunteerName?.split(' ')[0] ?? '—'}
                                      </span>
                                    ))}
                                    {mySlot ? (
                                      <>
                                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                                          {session.user.name?.split(' ')[0]}
                                        </span>
                                        <form
                                          action={cancelSlot.bind(null, mySlot.slotId)}
                                          className="contents"
                                        >
                                          <button
                                            type="submit"
                                            className="text-xs px-1 py-0.5 rounded border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors w-fit"
                                          >
                                            {t('cancel')}
                                          </button>
                                        </form>
                                      </>
                                    ) : (
                                      <form
                                        action={signUpForSlot.bind(null, dateStr, period, animal.id)}
                                        className="contents"
                                      >
                                        <button
                                          type="submit"
                                          className="text-xs px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:hover:border-zinc-500 dark:hover:text-zinc-300 transition-colors"
                                        >
                                          +
                                        </button>
                                      </form>
                                    )}
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
