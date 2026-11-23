export interface DemoComparison {
  synthetic: true
  institutionId: string
  questionnaireId: string
  generationId: string
  profileId: string
  profileGenerationId: string
  questions: {
    id: string
    text: string
    kind: 'number' | 'single_choice' | 'multiple_choice'
  }[]
  questionId?: string
  metricId?: string
  participants: number
  paired: number
  groups: { label: string; count: number; mean: number | null }[]
  pearson: number | null
  etaSquared: number | null
}
