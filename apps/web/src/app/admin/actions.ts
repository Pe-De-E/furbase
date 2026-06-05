'use server'

import { db, animal } from '@furbase/db'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateAnimalStatus(
  id: string,
  status: (typeof animal.status.enumValues)[number],
) {
  await db
    .update(animal)
    .set({ status, updatedAt: new Date() })
    .where(eq(animal.id, id))
  revalidatePath('/admin/animals')
  revalidatePath('/')
}

export async function deleteAnimal(id: string) {
  await db.delete(animal).where(eq(animal.id, id))
  revalidatePath('/admin/animals')
  revalidatePath('/')
  redirect('/admin/animals')
}

export async function saveAnimal(formData: FormData) {
  const id = formData.get('id') as string | null

  const values = {
    name: formData.get('name') as string,
    species: formData.get(
      'species',
    ) as (typeof animal.species.enumValues)[number],
    breed: (formData.get('breed') as string) || null,
    age: formData.get('age') ? Number(formData.get('age')) : null,
    gender:
      (formData.get('gender') as (typeof animal.gender.enumValues)[number]) ||
      null,
    size:
      (formData.get('size') as (typeof animal.size.enumValues)[number]) || null,
    weight: (formData.get('weight') as string) || null,
    color: (formData.get('color') as string) || null,
    description: (formData.get('description') as string) || null,
    status: formData.get('status') as (typeof animal.status.enumValues)[number],
    arrivalDate: (formData.get('arrivalDate') as string) || null,
    isNeutered: formData.get('isNeutered') === 'on',
    isVaccinated: formData.get('isVaccinated') === 'on',
    isChipped: formData.get('isChipped') === 'on',
    goodWithKids:
      formData.get('goodWithKids') === 'true'
        ? true
        : formData.get('goodWithKids') === 'false'
          ? false
          : null,
    goodWithDogs:
      formData.get('goodWithDogs') === 'true'
        ? true
        : formData.get('goodWithDogs') === 'false'
          ? false
          : null,
    goodWithCats:
      formData.get('goodWithCats') === 'true'
        ? true
        : formData.get('goodWithCats') === 'false'
          ? false
          : null,
    activityLevel:
      (formData.get(
        'activityLevel',
      ) as (typeof animal.activityLevel.enumValues)[number]) || null,
    needsGarden: formData.get('needsGarden') === 'on',
    needsExperiencedOwner: formData.get('needsExperiencedOwner') === 'on',
    needsTraining: formData.get('needsTraining') === 'on',
    images:
      (formData.get('images') as string)
        ?.split('\n')
        .map((s) => s.trim())
        .filter(Boolean) ?? [],
    updatedAt: new Date(),
  }

  if (id) {
    await db.update(animal).set(values).where(eq(animal.id, id))
  } else {
    await db.insert(animal).values(values)
  }

  revalidatePath('/admin/animals')
  revalidatePath('/')
  redirect('/admin/animals')
}
