export enum MoodEnum {
  GOOD = 'good',
  NEUTRAL = 'neutral',
  HARD = 'hard',
}

export interface ICheckInTrendDay {
  day: number
  score: number | null
}

export interface ICheckInSummary {
  checkedInToday: boolean
  mood: MoodEnum | null
  streakDays: number
  average: number
  previousAverage: number
  trend: ICheckInTrendDay[]
  canCheckInNow: boolean
  nextCheckInAvailableAt: string | null
}
