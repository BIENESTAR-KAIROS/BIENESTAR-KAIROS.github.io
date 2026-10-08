export interface ManagedRecommendation {
  _id: string
  origin: 'kairos' | 'institution' | 'unclassified'
  instituteId: string | null
  questionnaireId: string
  target: 'overall' | 'dimension'
  dimensionId: string | null
  forResultBetween: { min: number; max: number }
  priority: number
  yieldToInstitutionOnTie: boolean
  recommendation: string
  category: string
  level: string
  implementationTime: string
  isActive: boolean
  revision: number
}
export interface RecommendationQuestionnaire {
  id: string
  title: string
  institutionId?: string
  hasOverall: boolean
  dimensions: { id: string; label: string }[]
}
export interface RecommendationCatalog {
  recommendations: ManagedRecommendation[]
  questionnaires: RecommendationQuestionnaire[]
  institutions: { _id: string; name: string }[]
}
