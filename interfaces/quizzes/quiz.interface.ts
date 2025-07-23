import type { IGroup } from '../group/group.interface'
import type { IInstitute } from '../institution/institution.interface'
import type { IUser } from '../users/user.interface'

export interface IQuestionOption {
  value: string
  text: string
  weight: number
  subquestions?: IQuestion[]
}

export interface IQuestion {
  id: string
  category: string
  options: IQuestionOption[]
  text: string
  type: string
}

export interface IQuiz {
  questionnaire: {
    id: string
    title: string
    description: string
    active: boolean
    creationDate: Date
    modificationDate: Date
    institution: IInstitute
    creator: IUser
    questions: IQuestion[]
    assignedGroups: IGroup[]
    evaluationConfiguration: {
      formulas: {
        autoestima: string
        autoaceptacion: string
        resiliencia: string
        bienestarGeneral: number
        porcentajeBienestar: number
      }
      categorias: string[]
      interpretaciones: {
        bajo: {
          min: number
          max: number
          descripcion: string
          recomendaciones: string
        }
        medio: {
          min: number
          max: number
          descripcion: string
          recomendaciones: string
        }
        alto: {
          min: number
          max: number
          descripcion: string
          recomendaciones: string
        }
      }
    }
  }
}
