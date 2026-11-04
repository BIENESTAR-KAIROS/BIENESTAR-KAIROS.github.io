export interface StatisticsPeriod {
  from: string
  until: string
  closed: boolean
}

export interface StatisticsSession {
  version: 1
  actorId: string
  institutionId: string
  permissions: ('statistics:read' | 'statistics:periods:write')[]
  expiresAt: number
}
