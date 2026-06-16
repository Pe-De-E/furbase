import { getTranslations } from 'next-intl/server'
import AnimalForm from '../animal-form'

export default async function NewAnimalPage() {
  const t = await getTranslations('AnimalForm')
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">{t('addAnimal')}</h1>
      <AnimalForm />
    </div>
  )
}
