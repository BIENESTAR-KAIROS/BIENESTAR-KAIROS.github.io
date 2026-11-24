import type {
  ComparisonKind,
  ComparisonResult,
} from './questionnaire-comparison.interface'

export interface DemoComparison extends ComparisonResult {
  synthetic: true
  institutionId: string
  questionnaireId: string
  generationId: string
  profileId: string
  profileGenerationId: string
  questions: {
    id: string
    text: string
    kind: ComparisonKind
  }[]
  questionId?: string
  metricId?: string
  participants: number
}
