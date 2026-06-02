'use server'

import { db, volunteerProfile } from '@shelter-os/db'
import { eq } from 'drizzle-orm'

export async function saveVolunteerProfile(userId: string, formData: FormData) {
  const values = {
    userId,
    canFoster:    formData.get('canFoster') === 'on',
    canTransport: formData.get('canTransport') === 'on',
    canWalkDogs:  formData.get('canWalkDogs') === 'on',
    canHelp:      formData.get('canHelp') === 'on',
    notes:        (formData.get('notes') as string) || null,
    updatedAt:    new Date(),
  }

  await db
    .insert(volunteerProfile)
    .values(values)
    .onConflictDoUpdate({
      target: volunteerProfile.userId,
      set: values,
    })
}
