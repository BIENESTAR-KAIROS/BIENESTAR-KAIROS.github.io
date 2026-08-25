export interface IDemographicHistoryEntry {
  id: string
  /** Submission number for this user, starting at 1. */
  version: number
  /** The answers exactly as they were submitted. */
  demographicData: Record<string, unknown>
  /** Answers that differ from the previous version. Empty on the first one. */
  changedFields: string[]
  submittedAt: string
}

export interface IDemographicHistory {
  total: number
  /** Newest version first. */
  entries: IDemographicHistoryEntry[]
}

export interface IDemographicSurveyAvailability {
  canUpdate: boolean
  /** Days the survey stays locked after each submission. */
  cooldownDays: number
  lastUpdatedAt: string | null
  nextUpdateAvailableAt: string | null
  daysUntilUpdate: number
  totalVersions: number
}
