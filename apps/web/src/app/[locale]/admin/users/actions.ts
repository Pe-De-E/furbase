'use server'

import { auth } from '@/auth'
import { db, user } from '@furbase/db'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function setUserRole(userId: string, role: 'user' | 'admin') {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')
  if (session.user.id === userId) throw new Error('Cannot change your own role')

  await db.update(user).set({ role }).where(eq(user.id, userId))
  revalidatePath('/admin/users')
}
