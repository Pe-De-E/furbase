'use server'

import { db, adoptionChecklistItem } from '@furbase/db'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveChecklistItem(formData: FormData) {
  const id = formData.get('id') as string | null
  const data = {
    textDe:        formData.get('textDe') as string,
    textEn:        formData.get('textEn') as string,
    descriptionDe: (formData.get('descriptionDe') as string) || null,
    descriptionEn: (formData.get('descriptionEn') as string) || null,
    sortOrder:     Number(formData.get('sortOrder') ?? 0),
  }

  if (id) {
    await db.update(adoptionChecklistItem).set(data).where(eq(adoptionChecklistItem.id, id))
  } else {
    await db.insert(adoptionChecklistItem).values(data)
  }

  revalidatePath('/admin/adoption')
  redirect('/admin/adoption')
}

export async function deleteChecklistItem(id: string) {
  await db.delete(adoptionChecklistItem).where(eq(adoptionChecklistItem.id, id))
  revalidatePath('/admin/adoption')
}

export async function reorderChecklistItems(orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(adoptionChecklistItem)
        .set({ sortOrder: index + 1 })
        .where(eq(adoptionChecklistItem.id, id)),
    ),
  )
  revalidatePath('/admin/adoption')
  revalidatePath('/adoption')
}
