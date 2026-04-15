export interface IUserSummary {
  _id: string
  name: string
  lastName: string
  surName?: string
  email: string
  roles: string[]
  active: boolean
  registrationDate: Date
  lastAccess?: Date
  quizCountLastSixMonths: number
}

export interface IPaginatedUsers {
  data: IUserSummary[]
  total: number
  page: number
  limit: number
  totalPages: number
}
