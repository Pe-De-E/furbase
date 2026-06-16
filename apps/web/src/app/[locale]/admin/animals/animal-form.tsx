import { saveAnimal, deleteAnimal } from '../actions'
import { getTranslations } from 'next-intl/server'
import type { InferSelectModel } from 'drizzle-orm'
import type { animal } from '@furbase/db'
import { db, species as speciesTable } from '@furbase/db'
import { asc } from 'drizzle-orm'

type Animal = InferSelectModel<typeof animal>

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'text-sm text-zinc-900 rounded-xl border border-zinc-200 px-4 py-2.5 focus:outline-none focus:border-zinc-400 bg-white placeholder:text-zinc-400'
const selectCls =
  'text-sm text-zinc-900 rounded-xl border border-zinc-200 px-4 py-2.5 focus:outline-none focus:border-zinc-400 bg-white'

export default async function AnimalForm({ animal: a }: { animal?: Animal }) {
  const [speciesList, t] = await Promise.all([
    db
      .select({ value: speciesTable.value, label: speciesTable.label })
      .from(speciesTable)
      .orderBy(asc(speciesTable.sortOrder)),
    getTranslations('AnimalForm'),
  ])
  const isEdit = !!a

  return (
    <form action={saveAnimal} className="flex flex-col gap-6">
      {isEdit && <input type="hidden" name="id" value={a.id} />}

      <div className="bg-white rounded-2xl border border-zinc-100 p-6 flex flex-col gap-5">
        <h2 className="font-semibold text-zinc-900">{t('sectionBasic')}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('fieldName')}>
            <input
              name="name"
              required
              defaultValue={a?.name}
              className={inputCls}
            />
          </Field>
          <Field label={t('fieldSpecies')}>
            <select
              name="species"
              required
              defaultValue={a?.species}
              className={selectCls}
            >
              {speciesList.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('fieldBreed')}>
            <input
              name="breed"
              defaultValue={a?.breed ?? ''}
              className={inputCls}
            />
          </Field>
          <Field label={t('fieldAge')}>
            <input
              name="age"
              type="number"
              min={0}
              defaultValue={a?.age ?? ''}
              className={inputCls}
            />
          </Field>
          <Field label={t('fieldGender')}>
            <select
              name="gender"
              defaultValue={a?.gender ?? ''}
              className={selectCls}
            >
              <option value="">—</option>
              <option value="male">{t('gender.male')}</option>
              <option value="female">{t('gender.female')}</option>
              <option value="unknown">{t('gender.unknown')}</option>
            </select>
          </Field>
          <Field label={t('fieldSize')}>
            <select
              name="size"
              defaultValue={a?.size ?? ''}
              className={selectCls}
            >
              <option value="">—</option>
              <option value="small">{t('size.small')}</option>
              <option value="medium">{t('size.medium')}</option>
              <option value="large">{t('size.large')}</option>
            </select>
          </Field>
          <Field label={t('fieldWeight')}>
            <input
              name="weight"
              type="number"
              step="0.01"
              defaultValue={a?.weight ?? ''}
              className={inputCls}
            />
          </Field>
          <Field label={t('fieldColor')}>
            <input
              name="color"
              defaultValue={a?.color ?? ''}
              className={inputCls}
            />
          </Field>
          <Field label={t('fieldStatus')}>
            <select
              name="status"
              required
              defaultValue={a?.status ?? 'available'}
              className={selectCls}
            >
              <option value="available">{t('status.available')}</option>
              <option value="reserved">{t('status.reserved')}</option>
              <option value="adopted">{t('status.adopted')}</option>
              <option value="quarantine">{t('status.quarantine')}</option>
              <option value="not_adoptable">{t('status.not_adoptable')}</option>
            </select>
          </Field>
          <Field label={t('fieldArrival')}>
            <input
              name="arrivalDate"
              type="date"
              defaultValue={a?.arrivalDate ?? ''}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label={t('fieldDescription')}>
          <textarea
            name="description"
            rows={4}
            defaultValue={a?.description ?? ''}
            className={`${inputCls} resize-none`}
          />
        </Field>

        <Field label={t('fieldImages')}>
          <textarea
            name="images"
            rows={3}
            defaultValue={a?.images?.join('\n') ?? ''}
            className={`${inputCls} resize-none font-mono text-xs`}
          />
        </Field>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 p-6 flex flex-col gap-5">
        <h2 className="font-semibold text-zinc-900">{t('sectionHealth')}</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(
            [
              'isNeutered',
              'isVaccinated',
              'isChipped',
              'needsGarden',
              'needsExperiencedOwner',
              'needsTraining',
            ] as const
          ).map((name) => (
            <label
              key={name}
              className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer"
            >
              <input
                type="checkbox"
                name={name}
                defaultChecked={(a?.[name as keyof Animal] as boolean) ?? false}
                className="accent-zinc-900"
              />
              {t(`checks.${name}` as Parameters<typeof t>[0])}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('fieldActivityLevel')}>
            <select
              name="activityLevel"
              defaultValue={a?.activityLevel ?? ''}
              className={selectCls}
            >
              <option value="">—</option>
              <option value="low">{t('activity.low')}</option>
              <option value="medium">{t('activity.medium')}</option>
              <option value="high">{t('activity.high')}</option>
            </select>
          </Field>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-zinc-700">{t('sectionCompat')}</p>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { name: 'goodWithKids', label: t('compatKids') },
                { name: 'goodWithDogs', label: t('compatDogs') },
                { name: 'goodWithCats', label: t('compatCats') },
              ] as const
            ).map(({ name, label }) => (
              <div key={name} className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500">{label}</span>
                <select
                  name={name}
                  defaultValue={
                    a?.[name as keyof Animal] === true
                      ? 'true'
                      : a?.[name as keyof Animal] === false
                        ? 'false'
                        : ''
                  }
                  className={selectCls}
                >
                  <option value="">{t('compat.unknown')}</option>
                  <option value="true">{t('compat.yes')}</option>
                  <option value="false">{t('compat.no')}</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {isEdit ? (
          <form action={deleteAnimal.bind(null, a.id)}>
            <button
              type="submit"
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              {t('deleteAnimal')}
            </button>
          </form>
        ) : (
          <div />
        )}

        <div className="flex gap-3">
          <a
            href="/admin/animals"
            className="px-4 py-2.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            {t('cancel')}
          </a>
          <button
            type="submit"
            className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors"
          >
            {isEdit ? t('saveChanges') : t('addAnimal')}
          </button>
        </div>
      </div>
    </form>
  )
}
