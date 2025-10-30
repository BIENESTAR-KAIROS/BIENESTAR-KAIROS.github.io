import type { UserGenderEnum } from './enum/user-gender.enum'
import type { StudentCampusData } from './user-student-compus-data.interface'

export interface StudentData {
  age: number
  gender: UserGenderEnum | string
  demographicData?: Record<string, any>
  demographicSurveyCompleted: boolean
  groupIds: string[]
  campusInformation?: StudentCampusData
}
