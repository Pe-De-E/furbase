'use client'

function openPicker(e: React.SyntheticEvent<HTMLInputElement>) {
  try {
    e.currentTarget.showPicker?.()
  } catch {
    // showPicker can throw (unsupported browser, or called too often) — ignore, native click still works
  }
}

export default function DateInput({
  name,
  defaultValue,
  className,
}: {
  name: string
  defaultValue?: string | null
  className?: string
}) {
  return (
    <input
      type="date"
      name={name}
      defaultValue={defaultValue ?? ''}
      className={className}
      onClick={openPicker}
      onFocus={openPicker}
    />
  )
}
