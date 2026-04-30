export interface ITrackingMonthlyStat {
  day: number
  count: number
  recommendations?: string[]
}

export interface ITrackingMonthlyStatsResponse {
  year: number
  month: number
  completedByDay: ITrackingMonthlyStat[]
}
