import type { DefinitionEvaluation } from '~/interfaces/quizzes/definition-result.interface'

export interface AdminUser {
  _id: string
  name: string
  lastName: string
  surName?: string
  email: string
  roles: string[]
  active: boolean
  isVerificated: boolean
  isDemo?: boolean
  institute?: string
  demoInstitutionIds?: string[]
  registrationDate?: string
  lastAccess?: string
  studentData?: {
    age?: number
    gender?: string
    campusInformation?: { name?: string; department?: string; career?: string }
  }
}
export interface AdminUsersPage {
  data: AdminUser[]
  total: number
  totalRegistered: number
  totalDemo: number
  page: number
  limit: number
}
export interface DemoUsersStatus {
  total: number
  institutions: { _id: string; count: number }[]
}
export interface AdminUserDetail {
  user: AdminUser
  history: {
    data: {
      _id: string
      questionnaireTitle: string
      score: number | null
      hasResult: boolean
      createdAt?: string
      evaluation?: DefinitionEvaluation
      subscales?: { key: string; average: number }[]
    }[]
    total: number
    page: number
    limit: number
  }
}
