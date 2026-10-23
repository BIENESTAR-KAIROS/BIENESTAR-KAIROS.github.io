export interface QuestionnaireStatsOption {
  id: string
  title: string
  description: string
  schemaVersion: number
  active: boolean
}
export interface QuestionnaireMetric {
  id: string
  label: string
  unit: string | null
  method: string | null
  n: number
  missing: number
  sampleSufficient: boolean
  mean: number | null
  min: number | null
  max: number | null
  std: number | null
  interpretations: { label: string; min: number; max?: number | null }[]
  bands: { label: string; count: number }[]
  timeline: { month: string; mean: number; n: number }[]
  distribution: { from: number; to: number; count: number }[]
}
export interface QuestionnaireStatsVersion {
  key: string
  revision: number | string
  schemaVersion: number
  scoringVersion: number
  respondents: number
  demoRespondents: number
  realRespondents: number
  coveragePct: number | null
  sampleSufficient: boolean
  metrics: QuestionnaireMetric[]
  questions: {
    id: string
    label: string
    type: string
    n: number
    mean: number | null
    options: { label: string; count: number }[]
  }[]
}
export interface QuestionnaireStatsResponse {
  questionnaire: { id: string; title: string }
  generatedAt: string
  totalStudents: number
  minGroupSize: number
  filterOptions: { campus: string[]; department: string[]; gender: string[] }
  versions: QuestionnaireStatsVersion[]
}
