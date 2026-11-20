import type {
  StudentAnswer,
  StudentQuestionnaireDefinition,
} from '../quizzes/student-questionnaire.interface'

export interface SociodemographicProfile {
  definition: StudentQuestionnaireDefinition
  answer: {
    id: string
    version: number
    updatedAt: string
    responses: { questionId: string; response: StudentAnswer }[]
  } | null
}
