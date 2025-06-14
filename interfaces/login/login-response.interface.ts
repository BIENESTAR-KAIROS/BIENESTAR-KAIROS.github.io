import type { IUser } from '../users/user.interface'

export interface ILoginResponse {
  message: string
  user: IUser
  accessToken: string
}
