import type { IConfiguration } from '../configs/config.interface'
import type { IInstitute } from '../institution/institution.interface'
import type { IUserStats } from '../users/user-stats.interface'

export interface IStatsResponse {
  institute?: IInstitute
  users?: IUserStats
  configurations?: IConfiguration
}
