import type { PublishedComparison } from './questionnaire-comparison.interface'

export interface PublicationQuery {
  institutionId: string
  questionnaireId: string
  definitionRevision: string
  from: string
  until: string
}

export interface PublicationValues {
  count: number
  mean: number
  median: number
  modes: number[]
  modeStatus: 'modes' | 'no_mode'
  populationStdDev: number
  min: number
  max: number
}

export interface PublicationCoverage {
  participants: number
  applicable: number
  valid: number
  missing: number
  invalid: number
  notApplicable: number
  requiredMissing: number
  unscored: number
  answered: number | null
  scoreFraction: number | null
  fraction: number | null
  requiredMissingFraction: number | null
  requiredMissingApplicableFraction: number | null
}

export interface PublicationMetric {
  label?: string
  id: string
  kind: 'question' | 'dimension' | 'overall'
  unit?: string
  method?: string
  publicationStatus: 'published' | 'suppressed'
  reasons: string[]
  warnings: string[]
  coverage: PublicationCoverage | null
  values: PublicationValues | null
}

export interface StatisticsPublication {
  comparisons?: PublishedComparison[]
  scope: {
    institutionId: string
    revision: {
      questionnaireId: string
      definitionRevision: string
      schemaVersion: 2
      scoringVersion: 1
    }
    population: 'real'
    from: string
    until: string
  }
  policyVersion: string
  releasePolicyVersion: string
  calculatedAt: string
  definitionFingerprint: string
  selectionPolicy: string
  minCohort: number
  requiredMissingThreshold: number
  participants: number
  retakes: {
    total: number
    participantsWithRetakes: number
    average: number
    averageAmongRepeaters: number | null
  } | null
  retakeReasons: string[]
  reasons: string[]
  questions: PublicationMetric[]
  metrics: PublicationMetric[]
}

export type StatisticsPublicationResponse =
  | { status: 'suppressed'; reasons: string[]; report: null }
  | { status: 'evaluated'; reasons: string[]; report: StatisticsPublication }

export interface PublicationLabels {
  questions: Record<string, string>
  metrics: Record<string, string>
}
