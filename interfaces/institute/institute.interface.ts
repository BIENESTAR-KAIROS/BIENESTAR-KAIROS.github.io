import type { InstituteCampusInformation } from './institute-campus-information.interface'

export interface IInstitute {
  _id: string
  name: string
  businessName: string
  address: string
  phoneNumber: string
  contactEmail: string
  registrationDate: Date
  active: boolean
  userAdminLimit: number
  currentUserAdmins: number
  campuses: InstituteCampusInformation[]
  emailDomains: string[]
  updatedAt: Date
  createdAt: Date
}
