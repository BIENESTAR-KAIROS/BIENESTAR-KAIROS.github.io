import type { UserGenderEnum } from '~/interfaces/user/enum/user-gender.enum'
import type { StudentCampusDataRequestDto } from './user-student-campus-data.request.dto'

export interface StudentDataRequestDto {
  age?: number
  gender?: UserGenderEnum
  campusInformation?: StudentCampusDataRequestDto
  groupIds?: string[]
}
