'use server'

import { auth } from '@/auth'
import { db, walkSlot, volunteerProfile } from '@furbase/db'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function signUpForSlot(
  date: string,
  period: 'morning' | 'afternoon',
  animalId: string,
) {
  const session = await auth()
  if (!session?.user?.id) return

  const volunteer = await db
    .select({ grantedWalkDogs: volunteerProfile.grantedWalkDogs })
    .from(volunteerProfile)
    .where(eq(volunteerProfile.userId, session.user.id))
    .then((r) => r[0])

  if (!volunteer?.grantedWalkDogs && session.user.role !== 'admin') return

  await db
    .insert(walkSlot)
    .values({ date, period, userId: session.user.id, animalId })
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
