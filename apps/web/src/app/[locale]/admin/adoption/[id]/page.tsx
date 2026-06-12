import { db, adoptionChecklistItem } from '@furbase/db'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import ChecklistItemForm from '../checklist-item-form'

export default async function EditChecklistItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [item] = await db
    .select()
    .from(adoptionChecklistItem)
    .where(eq(adoptionChecklistItem.id, id))

  if (!item) notFound()

  return <ChecklistItemForm item={item} />
}
