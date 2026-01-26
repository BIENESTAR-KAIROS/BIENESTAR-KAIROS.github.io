export interface IQuizAvaibleResponse {
  _id: string
  title: string
  description: string
  creatorId: string
  institution: string
  active: boolean
  groupAssignments: string[]
}

export interface IQuizzesAvaibleResponse {
  questionnaires: Array<IQuizAvaibleResponse>
  count: number
}
