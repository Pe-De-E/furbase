import type { InferSelectModel } from 'drizzle-orm'
import type { animal } from '@furbase/db'

type Animal = InferSelectModel<typeof animal>

export type MatcherProfile = {
  livingSituation: 'apartment' | 'house_with_garden'
  hasKids: boolean
  hasOtherDogs: boolean
  hasOtherCats: boolean
  activityLevel: 'low' | 'medium' | 'high'
  hoursAlone: '0-2' | '2-4' | '4-6' | '6+'
  experienceLevel: 'beginner' | 'experienced'
  preferredSpecies: string // '' = any
  preferredSize: 'small' | 'medium' | 'large' | 'any'
}

const ACTIVITY_RANK = { low: 0, medium: 1, high: 2 }

export type MatchResult = {
  animal: Animal
  score: number
  isCompatible: boolean
  reasons: string[]
}

export function scoreAnimal(a: Animal, p: MatcherProfile): MatchResult {
  const reasons: string[] = []

  // Hard filters — dealbreakers
  if (p.hasKids && a.goodWithKids === false) {
    return { animal: a, score: 0, isCompatible: false, reasons: ['Not good with kids'] }
  }
  if (p.hasOtherDogs && a.goodWithDogs === false) {
    return { animal: a, score: 0, isCompatible: false, reasons: ['Not good with dogs'] }
  }
  if (p.hasOtherCats && a.goodWithCats === false) {
    return { animal: a, score: 0, isCompatible: false, reasons: ['Not good with cats'] }
  }
  if (p.livingSituation === 'apartment' && a.needsGarden) {
    return { animal: a, score: 0, isCompatible: false, reasons: ['Needs a garden'] }
  }
  if (p.experienceLevel === 'beginner' && a.needsExperiencedOwner) {
    return { animal: a, score: 0, isCompatible: false, reasons: ['Needs experienced owner'] }
  }
  if (p.hoursAlone === '6+' && a.activityLevel === 'high') {
    return { animal: a, score: 0, isCompatible: false, reasons: ['Too active for long alone hours'] }
  }

  let score = 0

  // Activity level match (0-30 pts)
  if (a.activityLevel) {
    const diff = Math.abs(ACTIVITY_RANK[a.activityLevel] - ACTIVITY_RANK[p.activityLevel])
    if (diff === 0) { score += 30; reasons.push('Activity level matches perfectly') }
    else if (diff === 1) { score += 15; reasons.push('Activity level close match') }
  }

  // Species preference (0-25 pts)
  if (!p.preferredSpecies || a.species === p.preferredSpecies) {
    score += 25
    if (p.preferredSpecies) reasons.push(`Preferred species match`)
  }

  // Size preference (0-20 pts)
  if (p.preferredSize === 'any' || !p.preferredSize || a.size === p.preferredSize) {
    score += 20
    if (p.preferredSize !== 'any') reasons.push('Size matches your preference')
  }

  // Good with kids bonus (0-10 pts)
  if (p.hasKids && a.goodWithKids === true) {
    score += 10
    reasons.push('Good with kids')
  }

  // Needs training — slight penalty for beginners
  if (a.needsTraining && p.experienceLevel === 'beginner') {
    score -= 10
    reasons.push('Needs some training')
  }

  // Hours alone compatibility (0-15 pts)
  if (p.hoursAlone === '0-2') {
    score += 15
  } else if (p.hoursAlone === '2-4' && a.activityLevel !== 'high') {
    score += 10
  } else if (p.hoursAlone === '4-6' && a.activityLevel === 'low') {
    score += 5
  }

  return { animal: a, score: Math.max(0, score), isCompatible: true, reasons }
}

export function matchAnimals(animals: Animal[], profile: MatcherProfile): MatchResult[] {
  return animals
    .map(a => scoreAnimal(a, profile))
    .sort((a, b) => {
      if (a.isCompatible && !b.isCompatible) return -1
      if (!a.isCompatible && b.isCompatible) return 1
      return b.score - a.score
    })
}
