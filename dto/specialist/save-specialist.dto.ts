import type { SpecialistFields } from '~/interfaces/specialist/specialist.interface'

export interface CreateSpecialistDto extends SpecialistFields {
  instituteId?: string
}
export interface EditSpecialistDto extends SpecialistFields {
  revision: number
}
