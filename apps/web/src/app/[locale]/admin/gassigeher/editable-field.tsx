'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-8.5 8.5a2 2 0 0 1-.878.507l-3.09.883a.5.5 0 0 1-.62-.62l.883-3.09a2 2 0 0 1 .507-.878l8.5-8.5Z" />
    </svg>
  )
}

function openPicker(e: React.SyntheticEvent<HTMLInputElement>) {
  try {
    e.currentTarget.showPicker?.()
  } catch {
    // showPicker can throw (unsupported browser, or called too often) — ignore, native click still works
  }
}

export default function EditableField({
  name,
  defaultValue,
  value: controlledValue,
  onChange: controlledOnChange,
  type = 'text',
  placeholder,
  className,
  rows,
}: {
  name: string
  defaultValue?: string | null
  value?: string
  onChange?: (value: string) => void
  type?: 'text' | 'date' | 'textarea'
  placeholder?: string
  className: string
  rows?: number
}) {
  const t = useTranslations('GassigeherForm')
  const locale = useLocale()
  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const value = isControlled ? controlledValue : internalValue
  const setValue = (v: string) => (isControlled ? controlledOnChange?.(v) : setInternalValue(v))
  const [editing, setEditing] = useState(!value)

  if (!editing) {
    const display =
      type === 'date' && value ? new Intl.DateTimeFormat(locale).format(new Date(value)) : value
    return (
      <div className="flex items-start justify-between gap-2">
        <p className="flex-1 min-w-0 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words py-2.5">
          {display}
        </p>
        <input type="hidden" name={name} value={value} />
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={t('edit')}
          className="shrink-0 p-2 -m-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
      </div>
    )
  }

  if (type === 'textarea') {
    return (
      <textarea
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => value && setEditing(false)}
        placeholder={placeholder}
        rows={rows ?? 2}
        className={`${className} resize-y`}
      />
    )
  }

  if (type === 'date') {
    return (
      <input
        type="date"
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => value && setEditing(false)}
        onClick={openPicker}
        onFocus={openPicker}
        className={className}
      />
    )
  }

  return (
    <input
      name={name}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => value && setEditing(false)}
      placeholder={placeholder}
      className={className}
    />
  )
}
