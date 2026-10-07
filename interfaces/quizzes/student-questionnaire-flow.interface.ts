export interface StudentQuestionnaireItem {
  questionnaireId: string
  title: string
  description: string
  schemaVersion?: number
  canRespond: boolean
  canPreview?: boolean
  attemptId?: string
  solved: boolean
}
export interface StudentQuestionnaireQueueItem extends StudentQuestionnaireItem {
  order: number
}
export interface StudentQuestionnaireFlow {
  isActive: boolean
  queue: StudentQuestionnaireQueueItem[]
  questionnaires: StudentQuestionnaireItem[]
  nextQuestionnaireId: string | null
}
