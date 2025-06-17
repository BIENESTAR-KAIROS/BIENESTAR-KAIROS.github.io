import type { IInstitute } from '../institution/institution.interface'
import type { IAdministrativeData } from './administrative.interface'
import type { IKairosData } from './kairos.interface'
import type { IStudentData } from './student.interface'

export enum USER_TYPE {
  STUDENT = 'student',
  ADMINISTRATIVE = 'administrative',
  INSTITUTION = 'institution',
}

export interface IUser {
  id: string
  name: string
  type: USER_TYPE
  email: string
  password?: string
  registrationDate?: Date
  lastAccess?: Date
  active?: boolean
  institution?: IInstitute
  studentData?: IStudentData
  administrativeData?: IAdministrativeData
  kairosData?: IKairosData
}
