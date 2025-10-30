import type { UserRolEnum } from '~/interfaces/user/enum/user-rol.enum'
import type { KairosDataRequestDto } from './user-kairos-data.request.dto'
import type { InstituteDataRequestDto } from './user-intitute-data.request.dto'
import type { StudentDataRequestDto } from './user-student-data.request.dto'

export interface UserRegisterRequestDto {
  name: string
  lastName: string
  surName?: string
  email: string
  password: string
  roles?: UserRolEnum[]
  institute?: string
  kairosData?: KairosDataRequestDto
  instituteData?: InstituteDataRequestDto
  studentData?: StudentDataRequestDto
}
