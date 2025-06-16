export interface IQuizAvaibleResponse {
  id: string
  title: string
  description: string
  questionsCount: number
  estimatedTime: string
}

export interface IQuizzesAvaibleResponse {
  questionnaires: Array<IQuizAvaibleResponse>
  count: number
}
