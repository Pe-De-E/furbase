'use server'

import { db, matcherProfile } from '@furbase/db'
import { eq } from 'drizzle-orm'
import type { MatcherProfile } from '@/lib/matcher'

const HOURS_MAP: Record<string, number> = {
  '0-2': 2,
  '2-4': 4,
  '4-6': 6,
  '6+': 8,
}

export async function saveMatcherProfile(
  userId: string,
  profile: MatcherProfile,
) {
  const values = {
    userId,
    livingSituation: profile.livingSituation,
    hasKids: profile.hasKids,
    hasOtherDogs: profile.hasOtherDogs,
    hasOtherCats: profile.hasOtherCats,
    activityLevel: profile.activityLevel,
    hoursAlonePerDay: HOURS_MAP[profile.hoursAlone] ?? null,
    experienceLevel: profile.experienceLevel,
    preferredSpecies: profile.preferredSpecies,
    preferredSize: profile.preferredSize,
    updatedAt: new Date(),
  }

  await db
    .insert(matcherProfile)
    .values(values)
    .onConflictDoUpdate({ target: matcherProfile.userId, set: values })
}
