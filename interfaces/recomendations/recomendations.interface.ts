export enum CategoryRecomendationsEnum {
  RESILIENCE = 'Resiliencia',
  SOCIAL_RELATIONSHIPS = 'Relaciones Sociales',
  MOOD = 'Estado de Ánimo',
  SELF_PERCEPTION = 'Autopercepción',
  LIFE_PORPOUSE = 'Propósito de la vida',
  AUTONOMY = 'Autonomía',
  PERSONAL_LIFE_AND_STUDIES_BALANCE = 'Balance vida personal y estudios',
}

export enum LevelRecomendationEnum {
  LOW = 'leve',
  MODERATE = 'moderado',
  HARD = 'intenso',
}

export enum TimeRecomendationEnum {
  MORNING = 'morning',
  EVENING = 'evening',
  DAY = 'day',
  WEEK = 'week',
}
export interface IRecomendations {
  _id: string
  id: string
  category: CategoryRecomendationsEnum
  recommendation: string
  level: LevelRecomendationEnum
  time: TimeRecomendationEnum
}
