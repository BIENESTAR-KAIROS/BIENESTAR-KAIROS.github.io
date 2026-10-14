export interface RegistrationResponse {
  user: {
    name: string
    lastName: string
    surName?: string
    email: string
    isVerificated: boolean
  }
  accessToken: string
}
