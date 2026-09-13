'use server'

import { db, gassigeherFile, gassigeherCheckStep, volunteerProfile } from '@furbase/db'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { deleteUploadedImages } from '@/lib/uploads'
import { STEP_ORDER } from './steps'

export async function saveGassigeherFile(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  const userId = formData.get('userId') as string

  const values = {
    userId,
    contractImageUrl: (formData.get('contractImage') as string) || null,
    hundeerfahrung: (formData.get('hundeerfahrung') as string) || null,
    welcheHunde: (formData.get('welcheHunde') as string) || null,
    ausbildung: (formData.get('ausbildung') as string) || null,
    eigeneinschaetzung: (formData.get('eigeneinschaetzung') as string) || null,
    kategorie:
      (formData.get('kategorie') as (typeof gassigeherFile.kategorie.enumValues)[number]) ||
      null,
    aufnahme: formData.get('aufnahme') === 'on',
    aufnahmeDatum: (formData.get('aufnahmeDatum') as string) || null,
    datum: (formData.get('datum') as string) || null,
    unterschriftMitarbeiter: (formData.get('unterschriftMitarbeiter') as string) || null,
    updatedAt: new Date(),
  }

  const [existing] = await db
    .select({ contractImageUrl: gassigeherFile.contractImageUrl })
    .from(gassigeherFile)
    .where(eq(gassigeherFile.userId, userId))

  const [saved] = await db
    .insert(gassigeherFile)
    .values(values)
    .onConflictDoUpdate({ target: gassigeherFile.userId, set: values })
    .returning({ id: gassigeherFile.id })

  if (existing?.contractImageUrl && existing.contractImageUrl !== values.contractImageUrl) {
    await deleteUploadedImages([existing.contractImageUrl])
  }

  for (const step of STEP_ORDER) {
    const stepValues = {
      gassigeherFileId: saved.id,
      step,
      datum: (formData.get(`step_${step}_datum`) as string) || null,
      einschaetzung: (formData.get(`step_${step}_einschaetzung`) as string) || null,
      mitarbeiter: (formData.get(`step_${step}_mitarbeiter`) as string) || null,
    }
    await db
      .insert(gassigeherCheckStep)
      .values(stepValues)
      .onConflictDoUpdate({
        target: [gassigeherCheckStep.gassigeherFileId, gassigeherCheckStep.step],
        set: stepValues,
      })
  }

  const weiteresValues = {
    gassigeherFileId: saved.id,
    step: 'weiteres' as const,
    label: (formData.get('step_weiteres_label') as string) || null,
    datum: (formData.get('step_weiteres_datum') as string) || null,
    einschaetzung: (formData.get('step_weiteres_einschaetzung') as string) || null,
    mitarbeiter: (formData.get('step_weiteres_mitarbeiter') as string) || null,
  }
  await db
    .insert(gassigeherCheckStep)
    .values(weiteresValues)
    .onConflictDoUpdate({
      target: [gassigeherCheckStep.gassigeherFileId, gassigeherCheckStep.step],
      set: weiteresValues,
    })

  // "Aufnahme in die Gassigehergruppe" is what actually grants the dog-walking
  // permission — admins can still override it directly on /admin/volunteers.
  await db
    .update(volunteerProfile)
    .set({ grantedWalkDogs: values.aufnahme })
    .where(eq(volunteerProfile.userId, userId))

  revalidatePath('/admin/gassigeher')
  revalidatePath(`/admin/gassigeher/${userId}`)
  revalidatePath('/admin/volunteers')
  revalidatePath('/walks')
  redirect('/admin/gassigeher')
}

export async function deleteGassigeherFile(id: string) {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  const [existing] = await db
    .select({ userId: gassigeherFile.userId, contractImageUrl: gassigeherFile.contractImageUrl })
    .from(gassigeherFile)
    .where(eq(gassigeherFile.id, id))

  await db.delete(gassigeherFile).where(eq(gassigeherFile.id, id))
  if (existing?.contractImageUrl) await deleteUploadedImages([existing.contractImageUrl])

  revalidatePath('/admin/gassigeher')
  redirect('/admin/gassigeher')
}
