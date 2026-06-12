'use server'

import { db, adoptionChecklistProgress } from '@furbase/db'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function toggleChecklistItem(itemId: string, checked: boolean) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const userId = session.user.id

  if (checked) {
    await db
      .insert(adoptionChecklistProgress)
      .values({ userId, itemId })
      .onConflictDoNothing()
  } else {
    await db
      .delete(adoptionChecklistProgress)
      .where(
        and(
          eq(adoptionChecklistProgress.userId, userId),
          eq(adoptionChecklistProgress.itemId, itemId),
        ),
      )
  }

  revalidatePath('/adoption')
}
