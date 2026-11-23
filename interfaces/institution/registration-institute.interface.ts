export interface RegistrationInstitute {
  institutionType?: 'school' | 'company'
  _id: string
  name: string
  active: boolean
  emailDomains: string[]
}

export interface CreateRegistrationInstitute {
  institutionType: 'school' | 'company'
  campuses: {
    name: string
    address?: string
    phoneNumber?: string
    contactEmail?: string
    emailDomain?: string
    departments: { name: string; careers: string[] }[]
  }[]
  name: string
  businessName: string
  address: string
  phoneNumber: string
  contactEmail: string
  emailDomains: string[]
}
