import type {
  DefinitionEvaluation,
  AssignedRecommendation,
} from '~/interfaces/quizzes/definition-result.interface'

export interface IQuestionnaireResultItem {
  questionnaireResultId: string
  questionnaireTitle: string
  score: number | null
  schemaVersion?: number
  evaluation?: DefinitionEvaluation
  recommendations?: AssignedRecommendation[]
  createdAt: Date
}

export interface IUserDetail {
  _id: string
  name: string
  lastName: string
  surName?: string
  email: string
  roles: string[]
  active: boolean
  registrationDate: Date
  lastAccess?: Date
  studentData?: Record<string, unknown>
  instituteData?: Record<string, unknown>
  questionnaireResults: IQuestionnaireResultItem[]
}
