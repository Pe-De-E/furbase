import { describe, it, expect } from 'vitest'
import { scoreAnimal, matchAnimals, type MatcherProfile } from '../matcher'
import type { InferSelectModel } from 'drizzle-orm'
import type { animal } from '@furbase/db'

type Animal = InferSelectModel<typeof animal>

// Minimal animal factory — only set what the test needs
function makeAnimal(overrides: Partial<Animal> = {}): Animal {
  return {
    id: 'test-id',
    name: 'Test',
    species: 'dog',
    breed: null,
    breedSuspected: null,
    age: 24,
    gender: 'male',
    size: 'medium',
    weight: null,
    color: null,
    description: null,
    images: null,
    status: 'available',
    arrivalDate: null,
    isNeutered: false,
    isVaccinated: false,
    isChipped: false,
    goodWithKids: null,
    goodWithDogs: null,
    goodWithCats: null,
    activityLevel: 'medium',
    needsGarden: false,
    needsExperiencedOwner: false,
    needsTraining: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

const baseProfile: MatcherProfile = {
  livingSituation: 'house_with_garden',
  hasKids: false,
  hasOtherDogs: false,
  hasOtherCats: false,
  activityLevel: 'medium',
  hoursAlone: '2-4',
  experienceLevel: 'experienced',
  preferredSpecies: '',
  preferredSize: 'any',
}

// ─── Hard filters ────────────────────────────────────────────────────────────

describe('hard filters — should mark as incompatible', () => {
  it('animal not good with kids when user has kids', () => {
    const result = scoreAnimal(
      makeAnimal({ goodWithKids: false }),
      { ...baseProfile, hasKids: true }
    )
    expect(result.isCompatible).toBe(false)
    expect(result.score).toBe(0)
    expect(result.reasons).toContain('Not good with kids')
  })

  it('animal not good with dogs when user has dogs', () => {
    const result = scoreAnimal(
      makeAnimal({ goodWithDogs: false }),
      { ...baseProfile, hasOtherDogs: true }
    )
    expect(result.isCompatible).toBe(false)
    expect(result.reasons).toContain('Not good with dogs')
  })

  it('animal not good with cats when user has cats', () => {
    const result = scoreAnimal(
      makeAnimal({ goodWithCats: false }),
      { ...baseProfile, hasOtherCats: true }
    )
    expect(result.isCompatible).toBe(false)
    expect(result.reasons).toContain('Not good with cats')
  })

  it('animal needs garden but user lives in apartment', () => {
    const result = scoreAnimal(
      makeAnimal({ needsGarden: true }),
      { ...baseProfile, livingSituation: 'apartment' }
    )
    expect(result.isCompatible).toBe(false)
    expect(result.reasons).toContain('Needs a garden')
  })

  it('animal needs experienced owner but user is beginner', () => {
    const result = scoreAnimal(
      makeAnimal({ needsExperiencedOwner: true }),
      { ...baseProfile, experienceLevel: 'beginner' }
    )
    expect(result.isCompatible).toBe(false)
    expect(result.reasons).toContain('Needs experienced owner')
  })

  it('highly active animal left alone 6+ hours per day', () => {
    const result = scoreAnimal(
      makeAnimal({ activityLevel: 'high' }),
      { ...baseProfile, hoursAlone: '6+' }
    )
    expect(result.isCompatible).toBe(false)
    expect(result.reasons).toContain('Too active for long alone hours')
  })
})

// ─── Scoring ─────────────────────────────────────────────────────────────────

describe('scoring', () => {
  it('perfect activity level match gives 30 points', () => {
    const result = scoreAnimal(
      makeAnimal({ activityLevel: 'high' }),
      { ...baseProfile, activityLevel: 'high' }
    )
    expect(result.score).toBeGreaterThanOrEqual(30)
    expect(result.reasons).toContain('Activity level matches perfectly')
  })

  it('activity level one step off gives 15 points', () => {
    const result = scoreAnimal(
      makeAnimal({ activityLevel: 'high', size: 'any' as any }),
      { ...baseProfile, activityLevel: 'medium', preferredSize: 'any' }
    )
    expect(result.reasons).toContain('Activity level close match')
  })

  it('preferred species match gives bonus', () => {
    const result = scoreAnimal(
      makeAnimal({ species: 'cat' }),
      { ...baseProfile, preferredSpecies: 'cat' }
    )
    expect(result.isCompatible).toBe(true)
    expect(result.reasons).toContain('Preferred species match')
  })

  it('species mismatch gives no species bonus', () => {
    const withMatch = scoreAnimal(
      makeAnimal({ species: 'dog' }),
      { ...baseProfile, preferredSpecies: 'dog' }
    )
    const withMismatch = scoreAnimal(
      makeAnimal({ species: 'cat' }),
      { ...baseProfile, preferredSpecies: 'dog' }
    )
    expect(withMatch.score).toBeGreaterThan(withMismatch.score)
  })

  it('good with kids gives bonus when user has kids', () => {
    const result = scoreAnimal(
      makeAnimal({ goodWithKids: true }),
      { ...baseProfile, hasKids: true }
    )
    expect(result.reasons).toContain('Good with kids')
  })

  it('needs training penalizes beginner score', () => {
    const withTraining = scoreAnimal(
      makeAnimal({ needsTraining: true }),
      { ...baseProfile, experienceLevel: 'beginner' }
    )
    const withoutTraining = scoreAnimal(
      makeAnimal({ needsTraining: false }),
      { ...baseProfile, experienceLevel: 'beginner' }
    )
    expect(withTraining.score).toBeLessThan(withoutTraining.score)
    expect(withTraining.reasons).toContain('Needs some training')
  })
})

// ─── matchAnimals ─────────────────────────────────────────────────────────────

describe('matchAnimals', () => {
  it('compatible animals come before incompatible ones', () => {
    const compatible = makeAnimal({ id: 'a', goodWithKids: true })
    const incompatible = makeAnimal({ id: 'b', goodWithKids: false })

    const results = matchAnimals([incompatible, compatible], {
      ...baseProfile,
      hasKids: true,
    })

    expect(results[0].animal.id).toBe('a')
    expect(results[1].isCompatible).toBe(false)
  })

  it('higher scoring animals come first among compatible', () => {
    const perfectMatch = makeAnimal({ id: 'perfect', activityLevel: 'high', species: 'dog' })
    const weakMatch = makeAnimal({ id: 'weak', activityLevel: 'low', species: 'cat' })

    const results = matchAnimals([weakMatch, perfectMatch], {
      ...baseProfile,
      activityLevel: 'high',
      preferredSpecies: 'dog',
    })

    expect(results[0].animal.id).toBe('perfect')
  })

  it('returns empty array for empty input', () => {
    expect(matchAnimals([], baseProfile)).toEqual([])
  })
})
