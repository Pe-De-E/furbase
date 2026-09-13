'use client'

import { useState } from 'react'
import EditableField from './editable-field'

type StepField = {
  key: string
  label: string
  type?: 'text' | 'date' | 'textarea'
  placeholder?: string
}

export default function StepCard({
  label,
  fields,
  initialValues,
  inputClassName,
}: {
  label: string
  fields: StepField[]
  initialValues: Record<string, string>
  inputClassName: string
}) {
  const [values, setValues] = useState(initialValues)
  const complete = fields.every((f) => values[f.key])
  const [open, setOpen] = useState(() => !fields.every((f) => initialValues[f.key]))

  return (
    <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 p-4 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {complete && (
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0">
              ✓
            </span>
          )}
          {label}
        </span>
        <span
          className={`text-zinc-400 dark:text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>
      <div className={`flex flex-col gap-3 px-4 pb-4 ${open ? '' : 'hidden'}`}>
        {fields.map((f) => (
          <div key={f.key} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{f.label}</label>
            <EditableField
              type={f.type}
              name={f.key}
              placeholder={f.placeholder}
              value={values[f.key]}
              onChange={(v) => setValues((old) => ({ ...old, [f.key]: v }))}
              className={inputClassName}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
