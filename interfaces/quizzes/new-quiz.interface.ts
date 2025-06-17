export interface INewQuestionOptionDto {
  value: string
  text: string
  weight?: number
}

export interface INewQuestionDto {
  text: string
  type: string
  options?: INewQuestionOptionDto[]
  category?: string
}

export class ICreateEvaluationConfigurationDto {
  formulas?: {}
  categories?: {}
  interpretations?: {}
}

export interface INewQuiz {
  title: string
  description?: string
  creatorId: string
  institutionId: string
  active?: boolean
  questions?: INewQuestionDto[]
  groupAssignments?: string[]
  evaluationConfiguration?: ICreateEvaluationConfigurationDto
}

export interface INewQuizResponse {
  message: string
  questionnaire: {
    id: string
    title: string
    active: boolean
    questionsCount: number
    assignedGroupsCount: number
    creationDate: Date
  }
}
