import type { QuestionAnswerResponseDto } from './question-answer.response.dto'

export interface QuestionnaireAnswerResponseDto {
  id: string
  studentId: string
  questionnaireId: string
  submittedAt: Date
  responses: QuestionAnswerResponseDto[]
  hasRecomendations: boolean
}
