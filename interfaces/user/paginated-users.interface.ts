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
  /** Último score de cuestionario, o null si nunca ha respondido uno. */
  wellbeingScore: number | null
}

/** Conteos por chip de filtro, para el ámbito de búsqueda actual. */
export interface IUserListFacets {
  all: number
  students: number
  staff: number
  inactive: number
  attention: number
}

export interface IPaginatedUsers {
  data: IUserSummary[]
  total: number
  page: number
  limit: number
  totalPages: number
  facets: IUserListFacets
}
