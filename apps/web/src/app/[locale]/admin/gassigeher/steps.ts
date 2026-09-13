import type { gassigeherCheckStepEnum } from '@furbase/db'

export type GassigeherStep = (typeof gassigeherCheckStepEnum.enumValues)[number]

// Fixed Einweisung rows from the paper form, in display order. 'weiteres' is
// handled separately since it also carries a free-text label.
export const STEP_ORDER: Exclude<GassigeherStep, 'weiteres'>[] = [
  'kennenlernen',
  'regeln',
  'spaziergang_1',
  'spaziergang_2',
  'spaziergang_3',
  'schulung',
  'social_walk',
]
