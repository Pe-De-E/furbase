'use server'

import { auth } from '@/auth'
import { db, walkSlot, volunteerProfile } from '@furbase/db'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function signUpForSlot(date: string, period: 'morning' | 'afternoon') {
  const session = await auth()
  if (!session?.user?.id) return

  const isVolunteer = await db
    .select({ id: volunteerProfile.id })
    .from(volunteerProfile)
    .where(eq(volunteerProfile.userId, session.user.id))
    .then((r) => r.length > 0)

  if (!isVolunteer && session.user.role !== 'admin') return

  await db
    .insert(walkSlot)
    .values({ date, period, userId: session.user.id })
    .onConflictDoNothing()

  revalidatePath('/walks')
}

export async function cancelSlot(slotId: string) {
  const session = await auth()
  if (!session?.user?.id) return

  await db
    .delete(walkSlot)
    .where(and(eq(walkSlot.id, slotId), eq(walkSlot.userId, session.user.id)))

  revalidatePath('/walks')
}
