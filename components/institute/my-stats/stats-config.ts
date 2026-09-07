import type { StatsBandKey } from '~/interfaces/stats/institute-stats.interface'

/**
 * Base de datos que consulta el servicio de analítica. Va en la ruta, no en un
 * query param, porque ese servicio explora varias bases.
 */
export const ANALYTICS_DB = 'BienestarKairosDev'
export const ANALYTICS_QUESTIONNAIRE = 'bienestar30'

/** Escala del instrumento de 30 reactivos. */
export const SCORE_MIN = 30
export const SCORE_MAX = 150
export const WELLBEING_MAX = 5

/**
 * Piso de anonimato por omisión. El backend manda el suyo en cada respuesta;
 * este solo cubre el primer render, antes de que llegue.
 */
export const DEFAULT_MIN_GROUP_SIZE = 8

/** Cobertura a partir de la cual la lectura se considera representativa. */
export const REPRESENTATIVE_COVERAGE_PCT = 30

/**
 * Cobertura mínima para abrir el tablero. Por debajo, lo que se ve no es una
 * población sino los primeros que contestaron.
 */
export const MIN_COVERAGE_TO_OPEN_PCT = 10

/**
 * Periodos, del más corto al más largo. `days: null` es el histórico completo:
 * sin límite inferior de fecha y, por lo tanto, sin periodo anterior contra el
 * cual comparar.
 *
 * El orden importa: cuando un cruce deja menos respuestas que el piso de
 * anonimato, el panel ofrece el siguiente periodo de esta lista como salida.
 */
export const PERIOD_OPTIONS: Array<{
  value: string
  days: number | null
  label: string
  short: string
}> = [
  { value: '8d', days: 8, label: 'Últimos 8 días', short: '8 d' },
  { value: '15d', days: 15, label: 'Últimos 15 días', short: '15 d' },
  { value: '30d', days: 30, label: 'Últimos 30 días', short: '30 d' },
  { value: '3m', days: 90, label: 'Últimos 3 meses', short: '3 m' },
  { value: '6m', days: 182, label: 'Últimos 6 meses', short: '6 m' },
  { value: '1y', days: 365, label: 'Último año', short: '1 a' },
  { value: '3y', days: 1095, label: 'Últimos 3 años', short: '3 a' },
  { value: 'all', days: null, label: 'Histórico completo', short: 'Todo' },
]

export const DEFAULT_PERIOD_DAYS = 30

export const periodByDays = (days: number | null) =>
  PERIOD_OPTIONS.find((option) => option.days === days)

export const periodLabelFor = (days: number | null) =>
  periodByDays(days)?.label ?? `Últimos ${days} días`

/**
 * El siguiente periodo más largo, para proponer una salida cuando la muestra
 * no alcanza. Devuelve null si ya se está en el histórico completo.
 */
export function nextWiderPeriod(days: number | null) {
  if (days === null) return null
  const index = PERIOD_OPTIONS.findIndex((option) => option.days === days)
  if (index === -1) return PERIOD_OPTIONS[PERIOD_OPTIONS.length - 1]
  return PERIOD_OPTIONS[index + 1] ?? null
}

/**
 * Meses de historia que se piden para la serie por dimensión.
 *
 * No baja de 6 —el detalle del diseño muestra seis periodos— ni sube de 12:
 * más de doce barras en el ancho del diálogo dejan de leerse, y la serie
 * mensual deja de ser el instrumento correcto para esa ventana.
 */
export function timelineMonthsFor(days: number | null): number {
  if (days === null) return 12
  return Math.max(6, Math.min(12, Math.ceil(days / 30)))
}

export const AGE_RANGE_OPTIONS = [
  { value: '18-24', label: '18 a 24', min: 18, max: 24 },
  { value: '25-29', label: '25 a 29', min: 25, max: 29 },
  { value: '30-99', label: '30 o más', min: 30, max: 99 },
]

/**
 * Las cinco dimensiones del instrumento. Las claves son las del servicio de
 * analítica (`subscale_avg[].subscale`) y las mismas que guarda escanor en
 * `Questionnaire_Result.subscales[].key`.
 */
export const DIMENSION_LABELS: Record<string, string> = {
  nucleo_emocional: 'Estado de ánimo',
  dim_b: 'Resiliencia',
  dim_c: 'Relaciones sociales',
  dim_d: 'Propósito',
  dim_e: 'Autonomía',
}

/**
 * Tres franjas de lectura sobre la escala 30–150. El corte no es estadístico
 * sino operativo: marca a quién hay que buscar, a quién seguir y a quién no.
 */
export const SCORE_BANDS: Array<{
  key: StatsBandKey
  label: string
  hint: string
  max: number
}> = [
  {
    key: 'attention',
    label: 'Requiere atención',
    hint: 'Ver en Mis usuarios',
    max: 75,
  },
  {
    key: 'average',
    label: 'En el promedio',
    hint: 'Seguimiento normal',
    max: 105,
  },
  {
    key: 'high',
    label: 'Bienestar alto',
    hint: 'Sin acción requerida',
    max: SCORE_MAX,
  },
]

export function bandForScore(score: number): StatsBandKey {
  return (
    SCORE_BANDS.find((band) => score <= band.max) ??
    SCORE_BANDS[SCORE_BANDS.length - 1]
  ).key
}

/** Años de estudio, con el nombre que usa el panel en vez del número crudo. */
export const STUDY_YEAR_LABELS: Record<string, string> = {
  '1': 'Primer año',
  '2': 'Segundo año',
  '3': 'Tercer año',
  '4': 'Cuarto año',
  '5': 'Quinto año',
}

/** Promedio de dimensión con un decimal fijo, para que la columna alinee. */
export function formatAverage(value: number | null): string {
  return value === null ? '—' : value.toFixed(1)
}

export const MONTH_LABELS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]
