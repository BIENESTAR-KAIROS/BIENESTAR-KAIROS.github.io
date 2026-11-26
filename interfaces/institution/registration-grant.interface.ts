import type { UserRolEnum } from '~/interfaces/user/enum/user-rol.enum'

export type InstitutionalRole = Exclude<UserRolEnum, UserRolEnum.KAIROS_ADMIN>

export interface RegistrationGrant {
  _id: string
  role: InstitutionalRole
}
