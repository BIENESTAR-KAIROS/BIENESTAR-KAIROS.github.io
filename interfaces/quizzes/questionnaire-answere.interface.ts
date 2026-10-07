export interface SendQuestionAnswerDto {
  questionId: string // * Must be a mongo ObjectId but string for flexibility=
  response: unknown
}

export interface CreateQuestionnaireAnswerDto {
  attemptId?: string
  studentId: string
  questionnaireId: string
  submittedAt?: Date
  responses: SendQuestionAnswerDto[]
}
