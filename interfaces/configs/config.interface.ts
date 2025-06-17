import type { IFunctionalConfiguration } from './functional-config.interface'
import type { INotificationConfiguration } from './notification-configuration.interface'
import type { ISurveyConfiguration } from './survey-configuration.interface'

export interface IConfiguration {
  visualConfiguration?: {}
  functionalConfiguration?: IFunctionalConfiguration
  surveyConfiguration?: ISurveyConfiguration
  notificationConfiguration?: INotificationConfiguration
  updateDate?: Date
  configurationVersion?: number
}
