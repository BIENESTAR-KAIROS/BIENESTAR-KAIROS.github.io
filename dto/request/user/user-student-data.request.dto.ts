import type { UserGenderEnum } from '~/interfaces/user/enum/user-gender.enum'
import type { StudentCampusDataRequestDto } from './user-student-campus-data.request.dto'
import type { StudentDemographicDataRequestDto } from './user-student-demographic-data.request.dto'

export interface StudentDataRequestDto {
  age?: number
  gender?: UserGenderEnum
  campusInformation?: StudentCampusDataRequestDto
  demographicData?: StudentDemographicDataRequestDto
  groupIds?: string[]
}
