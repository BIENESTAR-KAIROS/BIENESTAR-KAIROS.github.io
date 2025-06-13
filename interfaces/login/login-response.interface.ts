import type { IUser, USER_TYPE } from '../users/user.interface'

export interface ILoginResponse {
  message: string
  user: IUser
  accessToken: string
}
