export interface SendQuestionAnswerDto {
  questionId: string // * Must be a mongo ObjectId but string for flexibility=
  response: any
}

export interface CreateQuestionnaireAnswerDto {
  studentId: string
  questionnaireId: string
  submittedAt?: Date
  responses: SendQuestionAnswerDto[]
}
