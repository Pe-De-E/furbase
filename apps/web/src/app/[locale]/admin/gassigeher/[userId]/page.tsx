import { db, user, volunteerProfile, gassigeherFile, gassigeherCheckStep } from '@furbase/db'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import GassigeherForm from '../gassigeher-form'

export default async function EditGassigeherPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params

  const [[gassigeherUser], [volunteer], [file], t] = await Promise.all([
    db.select().from(user).where(eq(user.id, userId)),
    db.select().from(volunteerProfile).where(eq(volunteerProfile.userId, userId)),
    db.select().from(gassigeherFile).where(eq(gassigeherFile.userId, userId)),
    getTranslations('GassigeherForm'),
  ])

  if (!gassigeherUser || !volunteer?.canWalkDogs) notFound()

  const steps = file
    ? await db
        .select()
        .from(gassigeherCheckStep)
        .where(eq(gassigeherCheckStep.gassigeherFileId, file.id))
    : []

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
        {t('editHeading')} — {gassigeherUser.name}
      </h1>
      <GassigeherForm gassigeherUser={gassigeherUser} file={file} steps={steps} />
    </div>
  )
}
