export interface RegistrationInstitute {
  _id: string
  name: string
  active: boolean
  emailDomains: string[]
}

export interface CreateRegistrationInstitute {
  name: string
  businessName: string
  address: string
  phoneNumber: string
  contactEmail: string
  emailDomains: string[]
}
