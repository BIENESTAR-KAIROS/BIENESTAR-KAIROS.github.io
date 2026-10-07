export interface InstituteSetting {
  id: string
  isActive: boolean
  demographicRetakeEnabled: boolean
  queue: { order: number; questionnaireId: string }[]
}

export interface QuestionnaireQueueOption {
  id: string
  title: string
  active: boolean
  status?: 'draft' | 'published'
}
