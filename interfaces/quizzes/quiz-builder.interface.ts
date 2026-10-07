export type BuilderQuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'number'
  | 'text'
  | 'date'
export type QuestionPresentation =
  | 'radio'
  | 'select'
  | 'scale'
  | 'checkbox'
  | 'number'
  | 'textarea'
  | 'date'
export type RiskLevel = 'low' | 'moderate' | 'high'
export interface BuilderOption {
  id: string
  text: string
  score: number | ''
  children: BuilderQuestion[]
}
export interface BuilderQuestion {
  id: string
  type: BuilderQuestionType
  presentation: QuestionPresentation
  text: string
  help: string
  block: string
  scoringMode: 'informational' | 'scored'
  scoringMethod: 'sum' | 'mean' | 'max' | 'direct'
  required: boolean
  options: BuilderOption[]
  maxAnswers: number
  min: number
  max: number
  maxLength: number
}
export interface EvaluationDimension {
  _id: string
  label: string
  method: 'sum' | 'mean' | 'weighted_mean'
  items: { questionId: string; weight: number }[]
  missingAnswers: 'invalidate' | 'exclude'
  skippedQuestions: 'exclude' | 'zero'
  minimumAnsweredPercentage: number
  interpretations: { risk: RiskLevel; label: string; min: number | '' }[]
}
export interface EvaluationConfiguration {
  schemaVersion: 1
  dimensions: EvaluationDimension[]
  overall: EvaluationDimension | null
  alarms: { dimensionId: string; enabled: boolean; risks: RiskLevel[] }[]
  alarmOperator: 'any'
  alarmLabel: string
}
export interface DefinitionQuestion {
  _id: string
  text: string
  helpText: string
  category: string
  type: BuilderQuestionType
  presentation: QuestionPresentation
  required: boolean
  order: number
  options: { _id: string; text: string; score: number | null }[]
  visibleWhen: {
    questionId: string
    operator: 'includesAny'
    optionIds: string[]
  } | null
  scoring: {
    mode: 'informational' | 'scored'
    method: 'sum' | 'mean' | 'max' | 'direct'
  }
  constraints: {
    maxSelections?: number
    min?: number
    max?: number
    maxLength?: number
  }
}
export interface CreateQuestionnaireRequest {
  institution: string
  title: string
  description: string
  questions: DefinitionQuestion[]
  evaluationConfiguration: EvaluationConfiguration
}
export interface UpdateQuestionnaireRequest extends Omit<
  CreateQuestionnaireRequest,
  'institution'
> {
  revision: number
}
export interface QuestionnaireActiveResponse {
  id: string
  active: boolean
  revision: number
  modificationDate?: string
}
export interface QuestionnaireDefinition extends CreateQuestionnaireRequest {
  _id: string
  schemaVersion: 2
  status: 'draft' | 'published'
  active: boolean
  __v?: number
}
