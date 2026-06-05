'use server'

import { db, species } from '@furbase/db'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function addSpecies(formData: FormData) {
  const value = (formData.get('value') as string)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
  const label = (formData.get('label') as string).trim()
  if (!value || !label) return

  await db.insert(species).values({ value, label })
  revalidatePath('/admin/species')
  revalidatePath('/')
}

export async function deleteSpecies(id: string) {
  await db.delete(species).where(eq(species.id, id))
  revalidatePath('/admin/species')
  revalidatePath('/')
}
