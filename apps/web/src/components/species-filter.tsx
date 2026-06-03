const OPTIONS = [
  { value: '',             label: 'All' },
  { value: 'dog',          label: 'Dogs' },
  { value: 'cat',          label: 'Cats' },
  { value: 'rabbit',       label: 'Rabbits' },
  { value: 'bird',         label: 'Birds' },
  { value: 'small_animal', label: 'Small Animals' },
  { value: 'other',        label: 'Other' },
]

export default function SpeciesFilter({ active }: { active?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map(opt => {
        const isActive = opt.value === '' ? !active : opt.value === active
        const href = opt.value ? `?species=${opt.value}` : '/'
        return (
          <a
            key={opt.value}
            href={href}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-400'
            }`}
          >
            {opt.label}
          </a>
        )
      })}
    </div>
  )
}
