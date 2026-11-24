export type ComparisonKind = 'number' | 'single_choice' | 'multiple_choice'

export interface ComparisonResult {
  paired: number
  groups: { label: string; count: number; mean: number | null }[]
  pearson: number | null
  etaSquared: number | null
}

export interface PublishedComparison extends ComparisonResult {
  questionId: string
  kind: ComparisonKind
  text: string
  metricId: string
}
