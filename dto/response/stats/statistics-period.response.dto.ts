import type { StatisticsPeriod } from '~/interfaces/stats/statistics-period.interface'

export interface StatisticsPeriodsResponse {
  periods: StatisticsPeriod[]
  limits: { maxPeriods: number; maxDurationDays: number }
}

export interface RegisterPeriodResponse {
  period: StatisticsPeriod
  created: boolean
}
