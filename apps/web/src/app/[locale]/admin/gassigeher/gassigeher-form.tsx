import { saveGassigeherFile } from './actions'
import { getTranslations } from 'next-intl/server'
import type { InferSelectModel } from 'drizzle-orm'
import type { gassigeherFile, gassigeherCheckStep, user } from '@furbase/db'
import Link from 'next/link'
import ContractUpload from './contract-upload'
import DeleteFileButton from './delete-file-button'
import DateInput from './date-input'
import EditableField from './editable-field'
import KategorieSelect from './kategorie-select'
import StepCard from './step-card'
import { STEP_ORDER } from './steps'

type GassigeherFile = InferSelectModel<typeof gassigeherFile>
type GassigeherCheckStep = InferSelectModel<typeof gassigeherCheckStep>
type User = InferSelectModel<typeof user>

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'text-sm text-zinc-900 dark:text-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 bg-white dark:bg-zinc-800 placeholder:text-zinc-400 dark:placeholder:text-zinc-500'
const selectCls =
  'text-sm text-zinc-900 dark:text-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 bg-white dark:bg-zinc-800'

export default async function GassigeherForm({
  gassigeherUser,
  file,
  steps,
}: {
  gassigeherUser: User
  file?: GassigeherFile
  steps: GassigeherCheckStep[]
}) {
  const t = await getTranslations('GassigeherForm')
  const stepByKey = new Map(steps.map((s) => [s.step, s]))
  const weiteres = stepByKey.get('weiteres')

  return (
    <form action={saveGassigeherFile} className="flex flex-col gap-6">
      <input type="hidden" name="userId" value={gassigeherUser.id} />

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 flex flex-col gap-5">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{t('sectionHeader')}</h2>

        <Field label={t('fieldHundeerfahrung')}>
          <textarea
            name="hundeerfahrung"
            defaultValue={file?.hundeerfahrung ?? ''}
            rows={4}
            className={`${inputCls} resize-y`}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('fieldWelcheHunde')}>
            <input
              name="welcheHunde"
              defaultValue={file?.welcheHunde ?? ''}
              className={inputCls}
            />
          </Field>
          <Field label={t('fieldAusbildung')}>
            <input
              name="ausbildung"
              defaultValue={file?.ausbildung ?? ''}
              className={inputCls}
            />
          </Field>
          <Field label={t('fieldEigeneinschaetzung')}>
            <input
              name="eigeneinschaetzung"
              defaultValue={file?.eigeneinschaetzung ?? ''}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label={t('fieldContractImage')}>
          <ContractUpload defaultImage={file?.contractImageUrl ?? null} />
        </Field>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{t('sectionEinweisung')}</h2>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 dark:text-zinc-400">
                <th className="font-medium pb-2 pr-3">{t('sectionEinweisung')}</th>
                <th className="font-medium pb-2 pr-3 w-28">{t('colDatum')}</th>
                <th className="font-medium pb-2 pr-3">{t('colEinschaetzung')}</th>
                <th className="font-medium pb-2">{t('colMitarbeiter')}</th>
              </tr>
            </thead>
            <tbody>
              {STEP_ORDER.map((step) => {
                const row = stepByKey.get(step)
                return (
                  <tr key={step} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 pr-3 text-zinc-700 dark:text-zinc-300 whitespace-nowrap align-top">
                      {t(`step.${step}` as Parameters<typeof t>[0])}
                    </td>
                    <td className="py-2 pr-3 align-top">
                      <EditableField
                        type="date"
                        name={`step_${step}_datum`}
                        defaultValue={row?.datum}
                        className={inputCls}
                      />
                    </td>
                    <td className="py-2 pr-3 align-top">
                      <EditableField
                        type="textarea"
                        name={`step_${step}_einschaetzung`}
                        defaultValue={row?.einschaetzung}
                        rows={2}
                        className={`${inputCls} w-full`}
                      />
                    </td>
                    <td className="py-2 align-top">
                      <EditableField
                        name={`step_${step}_mitarbeiter`}
                        defaultValue={row?.mitarbeiter}
                        className={inputCls}
                      />
                    </td>
                  </tr>
                )
              })}
              <tr className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="py-2 pr-3 align-top">
                  <EditableField
                    name="step_weiteres_label"
                    placeholder={t('weiteresLabelPlaceholder')}
                    defaultValue={weiteres?.label}
                    className={inputCls}
                  />
                </td>
                <td className="py-2 pr-3 align-top">
                  <EditableField
                    type="date"
                    name="step_weiteres_datum"
                    defaultValue={weiteres?.datum}
                    className={inputCls}
                  />
                </td>
                <td className="py-2 pr-3 align-top">
                  <EditableField
                    type="textarea"
                    name="step_weiteres_einschaetzung"
                    defaultValue={weiteres?.einschaetzung}
                    rows={2}
                    className={`${inputCls} w-full`}
                  />
                </td>
                <td className="py-2 align-top">
                  <EditableField
                    name="step_weiteres_mitarbeiter"
                    defaultValue={weiteres?.mitarbeiter}
                    className={inputCls}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 sm:hidden">
          {STEP_ORDER.map((step) => {
            const row = stepByKey.get(step)
            const datumKey = `step_${step}_datum`
            const einschaetzungKey = `step_${step}_einschaetzung`
            const mitarbeiterKey = `step_${step}_mitarbeiter`
            return (
              <StepCard
                key={step}
                label={t(`step.${step}` as Parameters<typeof t>[0])}
                inputClassName={inputCls}
                fields={[
                  { key: datumKey, label: t('colDatum'), type: 'date' },
                  { key: einschaetzungKey, label: t('colEinschaetzung'), type: 'textarea' },
                  { key: mitarbeiterKey, label: t('colMitarbeiter') },
                ]}
                initialValues={{
                  [datumKey]: row?.datum ?? '',
                  [einschaetzungKey]: row?.einschaetzung ?? '',
                  [mitarbeiterKey]: row?.mitarbeiter ?? '',
                }}
              />
            )
          })}

          <StepCard
            label={weiteres?.label || t('sectionEinweisung')}
            inputClassName={inputCls}
            fields={[
              {
                key: 'step_weiteres_label',
                label: t('sectionEinweisung'),
                placeholder: t('weiteresLabelPlaceholder'),
              },
              { key: 'step_weiteres_datum', label: t('colDatum'), type: 'date' },
              { key: 'step_weiteres_einschaetzung', label: t('colEinschaetzung'), type: 'textarea' },
              { key: 'step_weiteres_mitarbeiter', label: t('colMitarbeiter') },
            ]}
            initialValues={{
              step_weiteres_label: weiteres?.label ?? '',
              step_weiteres_datum: weiteres?.datum ?? '',
              step_weiteres_einschaetzung: weiteres?.einschaetzung ?? '',
              step_weiteres_mitarbeiter: weiteres?.mitarbeiter ?? '',
            }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 flex flex-col gap-5">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{t('sectionFooter')}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('fieldKategorie')}>
            <KategorieSelect
              defaultValue={file?.kategorie ?? ''}
              labels={{
                empty: '—',
                gruen: t('kategorie.gruen'),
                gelb: t('kategorie.gelb'),
                rot: t('kategorie.rot'),
              }}
              className={selectCls}
            />
          </Field>
          <Field label={t('fieldAufnahmeDatum')}>
            <DateInput name="aufnahmeDatum" defaultValue={file?.aufnahmeDatum} className={inputCls} />
          </Field>
          <Field label={t('fieldDatum')}>
            <DateInput name="datum" defaultValue={file?.datum} className={inputCls} />
          </Field>
          <Field label={t('fieldUnterschriftMitarbeiter')}>
            <input
              name="unterschriftMitarbeiter"
              defaultValue={file?.unterschriftMitarbeiter ?? ''}
              className={inputCls}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
          <input
            type="checkbox"
            name="aufnahme"
            defaultChecked={file?.aufnahme ?? false}
            className="accent-zinc-900"
          />
          {t('fieldAufnahme')}
        </label>
      </div>

      <div className="flex items-center justify-between">
        {file ? <DeleteFileButton fileId={file.id} /> : <div />}

        <div className="flex gap-3">
          <Link
            href="/admin/gassigeher"
            className="px-4 py-2.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            {t('cancel')}
          </Link>
          <button
            type="submit"
            className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors"
          >
            {t('saveChanges')}
          </button>
        </div>
      </div>
    </form>
  )
}
