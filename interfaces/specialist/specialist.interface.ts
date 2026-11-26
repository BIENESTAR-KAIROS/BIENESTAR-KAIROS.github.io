export interface SpecialistFields {
  title: string
  image: string
  specialties: string[]
  locations: string[]
  officeHours?: string
  contacts: string[]
}

export interface SpecialistEntry extends SpecialistFields {
  _id: string
  instituteId: string | null
  revision: number
  visible: boolean
}
