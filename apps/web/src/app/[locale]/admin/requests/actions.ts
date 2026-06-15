'use server'

import { db, adoptionRequest } from '@furbase/db'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function updateRequestStatus(
  id: string,
  status: (typeof adoptionRequest.status.enumValues)[number],
) {
  await db
    .update(adoptionRequest)
    .set({ status, updatedAt: new Date() })
    .where(eq(adoptionRequest.id, id))

  revalidatePath('/admin/requests')
  revalidatePath('/profile')
}
