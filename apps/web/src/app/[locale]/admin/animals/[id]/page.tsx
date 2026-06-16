import { db, animal } from '@furbase/db'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import AnimalForm from '../animal-form'

export default async function EditAnimalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [row, t] = await Promise.all([
    db.select().from(animal).where(eq(animal.id, id)).then((r) => r[0]),
    getTranslations('AnimalForm'),
  ])
  if (!row) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">
        {t('editHeading')} — {row.name}
      </h1>
      <AnimalForm animal={row} />
    </div>
  )
}
