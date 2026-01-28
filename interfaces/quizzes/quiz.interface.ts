import type { IGroup } from '../group/group.interface'
import type { IInstitute } from '../institution/institution.interface'
import type { IUser } from '../users/user.interface'

export interface IQuestionOption {
  value: any
  text: string
  weight: number
  subquestions?: IQuestion[]
}

export interface IQuestion {
  id: string
  text: string
  type: QuestionTypeEnum
  options: IQuestionOption[]
  category?: string
}

export enum QuestionTypeEnum {
  MULTIPLE_CHOICE = 'multiple_choice',
  SINGLE_CHOICE = 'single_choice',
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
}

export interface IQuiz {
  id: string
  title: string
  description: string
  creatorId: string
  institution: string
  active: boolean
  groupAssignments: string[]
  questions: IQuestion[]
  canAccessQuestionHistory: boolean
}
