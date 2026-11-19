export interface CatalogQuestionnaire {
  _id: string
  title: string
  description?: string
  status: 'draft' | 'published'
  active: boolean
  __v: number
}
export interface CatalogSelection {
  id: string
  title: string
  revision: number
}
