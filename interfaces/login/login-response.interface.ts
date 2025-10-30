import type { IUser } from '../user/user.interface'

export interface ILoginResponse {
  message: string
  user: IUser
  accessToken: string
}
