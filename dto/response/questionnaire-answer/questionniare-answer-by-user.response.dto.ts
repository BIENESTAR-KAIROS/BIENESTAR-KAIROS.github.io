import type { IQuiz } from '~/interfaces/quizzes/quiz.interface'

export interface QuestionnaireAnswerByUserResponseDto {
  id: string
  studentId: string
  questionnaireId: IQuiz
  submittedAt: Date
}
