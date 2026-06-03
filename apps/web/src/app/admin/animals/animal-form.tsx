import { saveAnimal, deleteAnimal } from '../actions'
import type { InferSelectModel } from 'drizzle-orm'
import type { animal } from '@furbase/db'

type Animal = InferSelectModel<typeof animal>

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "text-sm rounded-xl border border-zinc-200 px-4 py-2.5 focus:outline-none focus:border-zinc-400 bg-white"
const selectCls = "text-sm rounded-xl border border-zinc-200 px-4 py-2.5 focus:outline-none focus:border-zinc-400 bg-white"

export default function AnimalForm({ animal: a }: { animal?: Animal }) {
  const isEdit = !!a

  return (
    <form action={saveAnimal} className="flex flex-col gap-6">
      {isEdit && <input type="hidden" name="id" value={a.id} />}

      <div className="bg-white rounded-2xl border border-zinc-100 p-6 flex flex-col gap-5">
        <h2 className="font-semibold text-zinc-900">Basic info</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name *">
            <input name="name" required defaultValue={a?.name} className={inputCls} />
          </Field>
          <Field label="Species *">
            <select name="species" required defaultValue={a?.species} className={selectCls}>
              {['dog','cat','rabbit','bird','small_animal','other'].map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </Field>
          <Field label="Breed">
            <input name="breed" defaultValue={a?.breed ?? ''} className={inputCls} />
          </Field>
          <Field label="Age (months)">
            <input name="age" type="number" min={0} defaultValue={a?.age ?? ''} className={inputCls} />
          </Field>
          <Field label="Gender">
            <select name="gender" defaultValue={a?.gender ?? ''} className={selectCls}>
              <option value="">—</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unknown">Unknown</option>
            </select>
          </Field>
          <Field label="Size">
            <select name="size" defaultValue={a?.size ?? ''} className={selectCls}>
              <option value="">—</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </Field>
          <Field label="Weight (kg)">
            <input name="weight" type="number" step="0.01" defaultValue={a?.weight ?? ''} className={inputCls} />
          </Field>
          <Field label="Color">
            <input name="color" defaultValue={a?.color ?? ''} className={inputCls} />
          </Field>
          <Field label="Status *">
            <select name="status" required defaultValue={a?.status ?? 'available'} className={selectCls}>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="adopted">Adopted</option>
              <option value="quarantine">Quarantine</option>
              <option value="not_adoptable">Not adoptable</option>
            </select>
          </Field>
          <Field label="Arrival date">
            <input name="arrivalDate" type="date" defaultValue={a?.arrivalDate ?? ''} className={inputCls} />
          </Field>
        </div>

        <Field label="Description">
          <textarea name="description" rows={4} defaultValue={a?.description ?? ''} className={`${inputCls} resize-none`} />
        </Field>

        <Field label="Image URLs (one per line)">
          <textarea
            name="images"
            rows={3}
            defaultValue={a?.images?.join('\n') ?? ''}
            placeholder="https://example.com/photo.jpg"
            className={`${inputCls} resize-none font-mono text-xs`}
          />
        </Field>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 p-6 flex flex-col gap-5">
        <h2 className="font-semibold text-zinc-900">Health & behavior</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: 'isNeutered',            label: 'Neutered' },
            { name: 'isVaccinated',           label: 'Vaccinated' },
            { name: 'isChipped',              label: 'Chipped' },
            { name: 'needsGarden',            label: 'Needs garden' },
            { name: 'needsExperiencedOwner',  label: 'Experienced owner' },
            { name: 'needsTraining',          label: 'Needs training' },
          ].map(({ name, label }) => (
            <label key={name} className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                name={name}
                defaultChecked={a?.[name as keyof Animal] as boolean ?? false}
                className="accent-zinc-900"
              />
              {label}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Activity level">
            <select name="activityLevel" defaultValue={a?.activityLevel ?? ''} className={selectCls}>
              <option value="">—</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </Field>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-zinc-700">Compatibility</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'goodWithKids', label: 'Kids' },
              { name: 'goodWithDogs', label: 'Dogs' },
              { name: 'goodWithCats', label: 'Cats' },
            ].map(({ name, label }) => (
              <div key={name} className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500">{label}</span>
                <select
                  name={name}
                  defaultValue={
                    a?.[name as keyof Animal] === true ? 'true'
                    : a?.[name as keyof Animal] === false ? 'false'
                    : ''
                  }
                  className={selectCls}
                >
                  <option value="">Unknown</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
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
              Delete animal
            </button>
          </form>
        ) : <div />}

        <div className="flex gap-3">
          <a href="/admin/animals" className="px-4 py-2.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            Cancel
          </a>
          <button
            type="submit"
            className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors"
          >
            {isEdit ? 'Save changes' : 'Add animal'}
          </button>
        </div>
      </div>
    </form>
  )
}
