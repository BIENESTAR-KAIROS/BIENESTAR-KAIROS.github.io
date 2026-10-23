import type { AdminUser } from './admin-user.interface'
export interface ManagedUserPayload {
  name: string
  lastName: string
  surName: string
  email?: string
  password?: string
  age?: number
  gender?: string
  campus: string
  roles?: string[]
  institutionId?: string | null
}
export interface ManagedUserResponse {
  id?: string
  user?: AdminUser
  verificationEmail?: 'accepted' | 'failed'
}
