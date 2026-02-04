import type { IInstitute } from '../institute/institute.interface'
import { UserRolEnum } from './enum/user-rol.enum'
import type { InstituteData } from './user-institute-data.interface'
import type { KairosData } from './user-kairos-data.interface'
import type { StudentData } from './user-student-data.interface'

export interface IUser {
  _id: string
  id: string
  name: string
  lastName: string
  surName: string
  email: string
  password: string
  roles: UserRolEnum[]
  registrationDate: Date
  active: boolean
  institute?: IInstitute
  kairosData?: KairosData
  instituteData?: InstituteData
  studentData?: StudentData
  lastAccess?: Date
  createdAt: Date
  updatedAt: Date
}
