import type { QuestionAnswerResponseDto } from './question-answer.response.dto'

export interface QuestionnaireAnswerResponseDto {
  id: string
  studentId: string
  questionnaireId: string
  submittedAt: string
  recommendations: { text: string; category?: string }[]
  responses: QuestionAnswerResponseDto[]
  hasRecomendations: boolean
}
