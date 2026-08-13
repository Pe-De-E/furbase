'use server'

import { auth } from '@/auth'
import { db, feedback } from '@furbase/db'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function resolveFeedback(id: string) {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  await db.update(feedback).set({ status: 'resolved' }).where(eq(feedback.id, id))
  revalidatePath('/admin/feedback')
}

export async function deleteFeedback(id: string) {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  await db.delete(feedback).where(eq(feedback.id, id))
  revalidatePath('/admin/feedback')
}
