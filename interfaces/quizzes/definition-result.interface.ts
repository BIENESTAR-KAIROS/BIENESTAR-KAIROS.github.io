export interface DimensionResult {
  dimensionId: string
  label: string
  score: number | null
  interpretation: string | null
  status: string
}
export interface DefinitionEvaluation {
  dimensions: DimensionResult[]
  overall: DimensionResult | null
  alarm: {
    status: string
    triggered: boolean | null
    label: string
    dimensionIds: string[]
  }
}
export interface AssignedRecommendation {
  recommendationId: string
  origin: 'kairos' | 'institution'
  target: 'overall' | 'dimension'
  dimensionId: string | null
  text: string
}
export interface DefinitionSubmissionResult {
  id: string
  resultId: string
  submittedAt: string
  schemaVersion: 2
  hasRecomendations: boolean
  evaluation: DefinitionEvaluation
  recommendations: AssignedRecommendation[]
}
