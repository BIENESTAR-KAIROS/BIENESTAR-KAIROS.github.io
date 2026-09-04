/**
 * Contratos del panel "Mis estadísticas".
 *
 * El tablero se arma con dos fuentes: el servicio de analítica (`$statsApi`),
 * que agrega las respuestas del periodo, y la API principal (`$axios`), que
 * aporta lo que el otro no guarda — el cambio contra el periodo anterior, la
 * historia mensual por dimensión y las vistas guardadas del usuario.
 */

/** Cortes de población. Viajan igual a las dos APIs, con distinto nombre de param. */
export interface IStatsFilters {
  /** Largo del periodo en días; `null` es el histórico completo. */
  days: number | null
  campus: string | null
  department: string | null
  ageRange: string | null
  gender: string | null
}

export interface IStatsFilterOptions {
  campus: string[]
  department: string[]
  gender: string[]
}

export interface IStatsPopulation {
  respondents: number
  /** Alumnos que podrían responder. Null cuando no hay instituto en la consulta. */
  totalStudents: number | null
  coveragePct: number | null
}

export interface IStatsPrivacy {
  /** Ningún corte con menos respuestas que esto se publica. */
  minGroupSize: number
  sampleSufficient: boolean
  hiddenCpCount: number
  hiddenCpAnswers: number
}

export interface IStatsGlobals {
  n: number
  mean: number | null
  std: number | null
  min: number | null
  max: number | null
  /** Promedio en la escala del instrumento, 1 a 5. */
  wellbeing: number | null
}

/** Un tramo del histograma de scores. */
export interface IScoreBucket {
  /** Límite inferior del tramo, o null para el cajón "otros". */
  from: number | null
  to: number | null
  label: string
  count: number
  band: StatsBandKey
}

export type StatsBandKey = 'attention' | 'average' | 'high'

export interface IStatsBand {
  key: StatsBandKey
  count: number
  percent: number
}

export interface IStatsDimension {
  key: string
  label: string
  /** Promedio 1 a 5. */
  average: number
  /** Cambio contra el periodo anterior; null cuando no hay con qué comparar. */
  delta: number | null
  n: number
}

export interface IStatsZone {
  cp: string
  place: string
  lat: number
  lng: number
  mean: number
  n: number
}

/** Un mes de la serie por dimensión. */
export interface IDimensionTimelinePoint {
  month: string
  average: number | null
  n: number
}

export interface IDimensionGroupBreakdown {
  group: string
  label: string
  average: number
  n: number
}

/** Lo que necesita el estado "detalle de una dimensión". */
export interface IDimensionDetail {
  key: string
  label: string
  average: number
  delta: number | null
  timeline: IDimensionTimelinePoint[]
  byGroup: IDimensionGroupBreakdown[]
}

export interface ISavedStatsView {
  id: string
  name: string
  filters: Partial<IStatsFilters>
  updatedAt: string
}

// ── Respuestas crudas ────────────────────────────────────────────────────────
// Se tipan tal como llegan, con nombres en snake_case, y se normalizan en
// `use-my-stats.ts`. Así un cambio de nombre en el backend se arregla en un
// solo lugar en vez de en cada plantilla.

export interface IAnalyticsSummaryResponse {
  generated_at?: string
  filter_options?: { campus: string[]; department: string[]; gender: string[] }
  population?: {
    respondents: number
    total_students: number | null
    coverage_pct: number | null
  }
  privacy?: { min_group_size: number; sample_sufficient: boolean }
  global_stats: {
    n: number
    mean: number | null
    std: number | null
    min: number | null
    max: number | null
    bienestar_promedio_1_5: number | null
  }
  score_distribution: Array<{ _id: number | 'other'; count: number }>
  subscale_avg: Array<{ subscale: string; avg: number; n: number }>
  timeline: Array<{ date: string; count: number }>
}

export interface IAnalyticsDemographicResponse {
  generated_at?: string
  privacy?: {
    min_group_size: number
    sample_sufficient: boolean
    hidden_cp_count: number
    hidden_cp_answers: number
  }
  population?: {
    respondents: number
    total_students: number | null
    coverage_pct: number | null
  }
  n: number
  cp_map: IStatsZone[]
  by_study_year: Array<{ label: string; mean: number; n: number }>
}

export interface IInstituteResultStatsResponse {
  period: { days: number; from: string; to: string }
  current: { n: number; meanScore: number | null; meanWellbeing: number | null }
  previous: {
    n: number
    meanScore: number | null
    meanWellbeing: number | null
  }
  deltas: {
    n: number | null
    meanScore: number | null
    meanWellbeing: number | null
    subscales: Array<{
      key: string
      current: number | null
      previous: number | null
      delta: number | null
    }>
  }
  subscaleTimeline: Array<{
    month: string
    subscales: Array<{ key: string; average: number; n: number }>
  }>
  subscaleByStudyYear: Array<{
    group: string
    subscales: Array<{ key: string; average: number; n: number }>
  }>
  privacy: {
    minGroupSize: number
    sampleSufficient: boolean
    hiddenGroupCount: number
  }
}
