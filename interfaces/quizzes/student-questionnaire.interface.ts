import type { DefinitionQuestion } from './quiz-builder.interface'

export interface StudentDefinitionQuestion extends Omit<
  DefinitionQuestion,
  'scoring' | 'options'
> {
  options: { _id: string; text: string }[]
}

export interface StudentQuestionnaireDefinition {
  _id: string
  schemaVersion: 2
  title: string
  description: string
  canAccessQuestionHistory: boolean
  questions: StudentDefinitionQuestion[]
}

// Choices carry option IDs, never scores. Absence is distinct from numeric zero.
export type StudentAnswer = string | number | string[]
export type StudentAnswers = Record<string, StudentAnswer>
