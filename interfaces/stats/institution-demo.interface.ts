import type { DemoJob } from './demo.interface'
import type { PublicationMetric } from './statistics-publication.interface'

export interface InstitutionDemoStatus {
  synthetic: true
  institutionId: string
  questionnaireId: string
  assignment: { id: string; revision: number; count: number }
  jobState: DemoJob['state'] | 'not_generated'
  hasActiveGeneration: boolean
  cleanupPending: boolean
}
export interface InstitutionDemoReport {
  synthetic: true
  institutionId: string
  questionnaireId: string
  assignmentId: string
  generationId: string
  configurationVersion: number
  definitionRevision: string
  policyVersion: string
  calculatedAt: string
  participants: number
  questions: PublicationMetric[]
  metrics: PublicationMetric[]
}
