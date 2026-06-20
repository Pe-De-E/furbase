'use server'

import { db, volunteerProfile } from '@furbase/db'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

export async function setVolunteerApproval(profileId: string, approved: boolean) {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  await db
    .update(volunteerProfile)
    .set({ approved })
    .where(eq(volunteerProfile.id, profileId))

  revalidatePath('/admin/volunteers')
  revalidatePath('/walks')
}
