import { db, animal } from '@furbase/db'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import AnimalForm from '../animal-form'

export default async function EditAnimalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [row] = await db.select().from(animal).where(eq(animal.id, id))
  if (!row) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">
        Edit — {row.name}
      </h1>
      <AnimalForm animal={row} />
    </div>
  )
}
