'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { MatcherProfile } from '@/lib/matcher'
import { saveMatcherProfile } from './actions'

type Step = 1 | 2 | 3 | 4 | 5 | 6
const TOTAL_STEPS = 6

type Draft = Partial<MatcherProfile>

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-2xl border-2 text-sm font-medium transition-all ${
        selected
          ? 'border-zinc-900 bg-zinc-900 text-white'
          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
      }`}
    >
      {children}
    </button>
  )
}

function ToggleButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
        selected
          ? 'border-zinc-900 bg-zinc-900 text-white'
          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
      }`}
    >
      {children}
    </button>
  )
}

export default function MatcherWizard({ userId }: { userId: string | null }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [draft, setDraft] = useState<Draft>({
    preferredSpecies: '',
    preferredSize: 'any',
    hasKids: false,
    hasOtherDogs: false,
    hasOtherCats: false,
  })

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft(d => ({ ...d, [key]: value }))
  }

  function next() {
    setStep(s => Math.min(s + 1, TOTAL_STEPS) as Step)
  }

  function back() {
    setStep(s => Math.max(s - 1, 1) as Step)
  }

  const [, startTransition] = useTransition()

  function submit() {
    const p = draft as MatcherProfile
    const params = new URLSearchParams({
      living: p.livingSituation,
      kids: String(p.hasKids),
      dogs: String(p.hasOtherDogs),
      cats: String(p.hasOtherCats),
      activity: p.activityLevel,
      alone: p.hoursAlone,
      experience: p.experienceLevel,
      species: p.preferredSpecies ?? '',
      size: p.preferredSize,
    })
    if (userId) startTransition(() => saveMatcherProfile(userId, p))
    router.push(`/matcher/results?${params.toString()}`)
  }

  const canProceed = (() => {
    if (step === 1) return !!draft.livingSituation
    if (step === 3) return !!draft.activityLevel
    if (step === 4) return !!draft.hoursAlone
    if (step === 5) return !!draft.experienceLevel
    return true
  })()

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <a href="/" className="text-lg font-semibold text-zinc-900">Tierherberge Pfaffenhofen</a>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Progress bar */}
          <div className="flex gap-1.5 mb-10">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < step ? 'bg-zinc-900' : 'bg-zinc-200'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Living situation */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-1">Where do you live?</h2>
              <p className="text-zinc-500 mb-6">This helps us find animals suited to your space.</p>
              <div className="flex flex-col gap-3">
                <OptionButton selected={draft.livingSituation === 'apartment'} onClick={() => set('livingSituation', 'apartment')}>
                  Apartment — no private garden
                </OptionButton>
                <OptionButton selected={draft.livingSituation === 'house_with_garden'} onClick={() => set('livingSituation', 'house_with_garden')}>
                  House with garden
                </OptionButton>
              </div>
            </div>
          )}

          {/* Step 2: Household */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-1">Who lives with you?</h2>
              <p className="text-zinc-500 mb-6">Select everything that applies.</p>
              <div className="flex flex-col gap-4">
                {(
                  [
                    { key: 'hasKids',      label: 'Children in the household' },
                    { key: 'hasOtherDogs', label: 'Other dogs' },
                    { key: 'hasOtherCats', label: 'Other cats' },
                  ] as const
                ).map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between bg-white border border-zinc-200 rounded-2xl px-5 py-4">
                    <span className="text-sm font-medium text-zinc-700">{label}</span>
                    <div className="flex gap-2">
                      <ToggleButton selected={draft[key] === true} onClick={() => set(key, true)}>Yes</ToggleButton>
                      <ToggleButton selected={draft[key] === false} onClick={() => set(key, false)}>No</ToggleButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Activity level */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-1">How active are you?</h2>
              <p className="text-zinc-500 mb-6">We'll match you with an animal that fits your lifestyle.</p>
              <div className="flex flex-col gap-3">
                <OptionButton selected={draft.activityLevel === 'low'} onClick={() => set('activityLevel', 'low')}>
                  <span className="font-semibold">Low</span>
                  <span className="block text-xs mt-0.5 opacity-70">Short walks, mostly relaxed at home</span>
                </OptionButton>
                <OptionButton selected={draft.activityLevel === 'medium'} onClick={() => set('activityLevel', 'medium')}>
                  <span className="font-semibold">Medium</span>
                  <span className="block text-xs mt-0.5 opacity-70">Daily walks, occasional outdoor activities</span>
                </OptionButton>
                <OptionButton selected={draft.activityLevel === 'high'} onClick={() => set('activityLevel', 'high')}>
                  <span className="font-semibold">High</span>
                  <span className="block text-xs mt-0.5 opacity-70">Lots of exercise, runs, hikes</span>
                </OptionButton>
              </div>
            </div>
          )}

          {/* Step 4: Hours alone */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-1">How long will the animal be alone per day?</h2>
              <p className="text-zinc-500 mb-6">On an average workday.</p>
              <div className="flex flex-col gap-3">
                {(['0-2', '2-4', '4-6', '6+'] as const).map(h => (
                  <OptionButton key={h} selected={draft.hoursAlone === h} onClick={() => set('hoursAlone', h)}>
                    {h === '6+' ? '6+ hours' : `${h} hours`}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Experience */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-1">How experienced are you with animals?</h2>
              <p className="text-zinc-500 mb-6">Be honest — it helps us find the right match.</p>
              <div className="flex flex-col gap-3">
                <OptionButton selected={draft.experienceLevel === 'beginner'} onClick={() => set('experienceLevel', 'beginner')}>
                  <span className="font-semibold">Beginner</span>
                  <span className="block text-xs mt-0.5 opacity-70">First pet or little experience</span>
                </OptionButton>
                <OptionButton selected={draft.experienceLevel === 'experienced'} onClick={() => set('experienceLevel', 'experienced')}>
                  <span className="font-semibold">Experienced</span>
                  <span className="block text-xs mt-0.5 opacity-70">Owned pets before, comfortable with training</span>
                </OptionButton>
              </div>
            </div>
          )}

          {/* Step 6: Preferences (optional) */}
          {step === 6 && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-1">Any preferences?</h2>
              <p className="text-zinc-500 mb-6">Optional — leave on "Any" to see all compatible animals.</p>

              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-sm font-medium text-zinc-700 mb-2">Species</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: '', label: 'Any' },
                      { value: 'dog', label: 'Dog' },
                      { value: 'cat', label: 'Cat' },
                      { value: 'rabbit', label: 'Rabbit' },
                      { value: 'bird', label: 'Bird' },
                      { value: 'small_animal', label: 'Small animal' },
                    ].map(opt => (
                      <ToggleButton key={opt.value} selected={draft.preferredSpecies === opt.value} onClick={() => set('preferredSpecies', opt.value)}>
                        {opt.label}
                      </ToggleButton>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-zinc-700 mb-2">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {(['any', 'small', 'medium', 'large'] as const).map(s => (
                      <ToggleButton key={s} selected={draft.preferredSize === s} onClick={() => set('preferredSize', s)}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </ToggleButton>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            {step > 1 ? (
              <button onClick={back} className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <button
                onClick={next}
                disabled={!canProceed}
                className="px-6 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-xl disabled:opacity-30 hover:bg-zinc-700 transition-colors"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={submit}
                className="px-6 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition-colors"
              >
                Find my matches →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
