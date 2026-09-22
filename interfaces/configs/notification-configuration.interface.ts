export interface INotificationConfiguration {
  emailEnabled: boolean
  emailTemplates: Record<string, unknown>
  pushNotifications: boolean
}
