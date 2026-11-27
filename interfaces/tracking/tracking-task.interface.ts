export interface ITrackingTask {
  recommendationId: string
  questionnaireTitle?: string | null
  assignedAt?: string | null
  recommendation: string
  implementationTime: string
  category: string
  isCompleted: boolean
}
