export interface ITrackingMonthlyStat {
  day: number
  count: number
}

export interface ITrackingMonthlyStatsResponse {
  year: number
  month: number
  completedByDay: ITrackingMonthlyStat[]
}
