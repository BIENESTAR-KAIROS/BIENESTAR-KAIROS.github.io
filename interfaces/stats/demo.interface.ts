import type { PublicationMetric } from './statistics-publication.interface'

export type DemoDistribution = 'uniform' | 'normal' | 'low' | 'high'
export interface DemoProfile {
  distribution: DemoDistribution
  center: number
  spread: number
  strength: number
}
export interface DemoControls {
  seed: string
  default: DemoProfile
  dimensions: { dimensionId: string; profile: DemoProfile }[]
}
export interface DemoConfiguration {
  version: number
  assignmentRevision: number
  definitionRevision: string
  definitionFingerprint: string
  controls: DemoControls
}
export interface DemoSubmission extends DemoConfiguration {
  assignmentId: string
}
export interface DemoJob {
  id: string
  state:
    'queued' | 'running' | 'prepared' | 'completed' | 'failed' | 'cancelled'
  configVersion: number
  cleanupComplete: boolean
  deadlineAt: string
}
export interface DemoInspection {
  synthetic: true
  assignment: { id: string; revision: number; count: number }
  revision: {
    questionnaireId: string
    definitionRevision: string
    schemaVersion: 2
    scoringVersion: 1
  }
  definitionFingerprint: string
  dimensionIds: string[]
  maxParticipants: number
  state: {
    latestVersion: number
    configurations: DemoConfiguration[]
    job: DemoJob | null
    activeGenerationId?: string
    cleanupPending: boolean
  }
}
export interface DemoReport {
  synthetic: true
  generationId: string
  assignmentId: string
  configuration: DemoConfiguration
  policyVersion: string
  calculatedAt: string
  participants: number
  questions: PublicationMetric[]
  metrics: PublicationMetric[]
}
