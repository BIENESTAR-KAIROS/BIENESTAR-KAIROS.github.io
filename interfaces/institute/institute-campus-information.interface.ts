import type { InstituteDepartmentInformation } from './institute-departement-information.interface'

export interface InstituteCampusInformation {
  name: string
  address: string
  phoneNumber: string
  contactEmail: string
  active: boolean
  departments: InstituteDepartmentInformation[]
  updatedAt: Date
  createdAt: Date
}
