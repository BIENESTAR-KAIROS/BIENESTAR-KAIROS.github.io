export interface QuestionnaireRetakeOption {
  questionnaireId: string
  title: string
  canRelease: boolean
  unavailableReason: string | null
  latestAttempt: {
    id: string
    status: 'pending' | 'completed'
    releasedAt: string
    releasedByName: string
    reason: string
    completedAt?: string
  } | null
}

export interface QuestionnaireRetakesResponse {
  institutionId: string
  sequenceActive: boolean
  questionnaires: QuestionnaireRetakeOption[]
}

export interface ReleaseQuestionnaireRetakesRequest {
  questionnaireIds: string[]
  reason?: string
}
