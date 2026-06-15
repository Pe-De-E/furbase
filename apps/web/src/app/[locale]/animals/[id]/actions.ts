'use server'

import { db, adoptionRequest } from '@furbase/db'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

export async function createAdoptionRequest(animalId: string, message: string | null) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const userId = session.user.id

  const existing = await db
    .select({ id: adoptionRequest.id })
    .from(adoptionRequest)
    .where(and(eq(adoptionRequest.userId, userId), eq(adoptionRequest.animalId, animalId)))
    .then((r) => r[0] ?? null)

  if (existing) return { alreadyExists: true }

  await db.insert(adoptionRequest).values({ userId, animalId, message: message || null })

  revalidatePath(`/animals/${animalId}`)
  revalidatePath('/profile')

  return { success: true }
}
