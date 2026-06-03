'use server'

import { db, favorite } from '@shelter-os/db'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(userId: string, animalId: string, isFavorited: boolean) {
  if (isFavorited) {
    await db.delete(favorite).where(and(eq(favorite.userId, userId), eq(favorite.animalId, animalId)))
  } else {
    await db.insert(favorite).values({ userId, animalId })
  }
  revalidatePath('/')
  revalidatePath('/profile')
}
