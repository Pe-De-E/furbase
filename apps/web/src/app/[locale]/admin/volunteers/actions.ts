'use server'

import { db, volunteerProfile } from '@furbase/db'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

const GRANT_FIELDS = [
  'grantedFoster',
  'grantedTransport',
  'grantedWalkDogs',
  'grantedHelp',
] as const

export type GrantField = (typeof GRANT_FIELDS)[number]

export async function setVolunteerGrant(profileId: string, field: GrantField, granted: boolean) {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')
  if (!GRANT_FIELDS.includes(field)) throw new Error('Invalid field')

  await db
    .update(volunteerProfile)
    .set({ [field]: granted })
    .where(eq(volunteerProfile.id, profileId))

  revalidatePath('/admin/volunteers')
  revalidatePath('/admin/gassigeher')
  revalidatePath('/walks')
}
