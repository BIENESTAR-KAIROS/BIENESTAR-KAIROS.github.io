import { useAuthStore } from '~/store/auth'
import type {
  IAnalyticsDemographicResponse,
  IAnalyticsSummaryResponse,
  IDimensionDetail,
  IInstituteResultStatsResponse,
  IScoreBucket,
  ISavedStatsView,
  IStatsBand,
  IStatsDimension,
  IStatsFilterOptions,
  IStatsFilters,
  IStatsGlobals,
  IStatsPopulation,
  IStatsPrivacy,
  IStatsZone,
  StatsBandKey,
} from '~/interfaces/stats/institute-stats.interface'
import {
  AGE_RANGE_OPTIONS,
  ANALYTICS_DB,
  ANALYTICS_QUESTIONNAIRE,
  DEFAULT_MIN_GROUP_SIZE,
  DEFAULT_PERIOD_DAYS,
  DIMENSION_LABELS,
  MIN_COVERAGE_TO_OPEN_PCT,
  MONTH_LABELS,
  SCORE_BANDS,
  SCORE_MAX,
  STUDY_YEAR_LABELS,
  bandForScore,
  nextWiderPeriod,
  timelineMonthsFor,
} from './stats-config'

export const EMPTY_FILTERS: IStatsFilters = {
  days: DEFAULT_PERIOD_DAYS,
  campus: null,
  department: null,
  ageRange: null,
  gender: null,
}

/** Los tres estados que el tablero puede tomar además del normal. */
export type StatsState =
  | 'loading'
  | 'error'
  | 'first-period'
  | 'insufficient-sample'
  | 'ready'

const analyticsPath = (endpoint: string) =>
  `/api/analytics/${ANALYTICS_DB}/${ANALYTICS_QUESTIONNAIRE}/${endpoint}`

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)

/** Traduce los filtros de pantalla a los params que espera cada API. */
function buildAnalyticsParams(filters: IStatsFilters, instituteId?: string) {
  const age = AGE_RANGE_OPTIONS.find(
    (option) => option.value === filters.ageRange,
  )

  // Histórico completo: se omite el rango y el servicio agrega todo lo que hay.
  const range =
    filters.days === null
      ? {}
      : {
          date_from: toIsoDate(
            new Date(Date.now() - filters.days * 86_400_000),
          ),
          date_to: toIsoDate(new Date()),
        }

  return {
    ...range,
    institute_id: instituteId,
    campus: filters.campus || undefined,
    department: filters.department || undefined,
    age_min: age?.min,
    age_max: age?.max,
    gender: filters.gender || undefined,
  }
}

function buildResultStatsParams(filters: IStatsFilters) {
  const age = AGE_RANGE_OPTIONS.find(
    (option) => option.value === filters.ageRange,
  )

  return {
    // Omitir `days` es lo que escanor lee como histórico: agrega todo y no
    // intenta comparar contra un periodo anterior que no existe.
    days: filters.days ?? undefined,
    months: timelineMonthsFor(filters.days),
    campus: filters.campus || undefined,
    department: filters.department || undefined,
    ageMin: age?.min,
    ageMax: age?.max,
    gender: filters.gender || undefined,
  }
}

/**
 * El histograma llega en cajones de 5 puntos. Dibujar 25 barras de 5 puntos en
 * una tarjeta no se lee, así que se reagrupan de tres en tres — 15 puntos por
 * barra — que es la resolución del diseño y la que deja ver las tres franjas.
 */
function buildDistribution(
  raw: IAnalyticsSummaryResponse['score_distribution'],
): IScoreBucket[] {
  const buckets = new Map<number, number>()

  for (const entry of raw ?? []) {
    if (entry._id === 'other' || typeof entry._id !== 'number') continue
    const start = Math.floor((entry._id - 30) / 15) * 15 + 30
    buckets.set(start, (buckets.get(start) ?? 0) + entry.count)
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([from, count]) => {
      const to = Math.min(from + 14, SCORE_MAX)
      return {
        from,
        to,
        label: `${from}-${to}`,
        count,
        band: bandForScore(to),
      }
    })
}

function buildBands(distribution: IScoreBucket[]): IStatsBand[] {
  const total = distribution.reduce((sum, bucket) => sum + bucket.count, 0)

  return SCORE_BANDS.map((band) => {
    const count = distribution
      .filter((bucket) => bucket.band === band.key)
      .reduce((sum, bucket) => sum + bucket.count, 0)

    return {
      key: band.key as StatsBandKey,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
    }
  })
}

/**
 * Ordena las dimensiones de menor a mayor promedio: el diseño sustituye el
 * radar por barras justamente para que la primera de la lista sea la que hay
 * que atender, sin tener que leer un polígono.
 */
function buildDimensions(
  subscales: IAnalyticsSummaryResponse['subscale_avg'],
  deltas: IInstituteResultStatsResponse['deltas']['subscales'] | undefined,
): IStatsDimension[] {
  const deltaByKey = new Map(
    (deltas ?? []).map((entry) => [entry.key, entry.delta]),
  )

  return (subscales ?? [])
    .filter((entry) => entry.subscale in DIMENSION_LABELS)
    .map((entry) => ({
      key: entry.subscale,
      label: DIMENSION_LABELS[entry.subscale],
      average: Number(entry.avg.toFixed(2)),
      delta: deltaByKey.get(entry.subscale) ?? null,
      n: entry.n,
    }))
    .sort((a, b) => a.average - b.average)
}

const monthLabel = (month: string) => {
  const [, monthPart] = month.split('-')
  return MONTH_LABELS[Number(monthPart) - 1] ?? month
}

export function useMyStats() {
  const { $axios, $statsApi } = useNuxtApp()
  const authStore = useAuthStore()

  const instituteId = computed(() => {
    const institute = authStore.user?.institute
    if (!institute) return undefined
    return typeof institute === 'string' ? institute : institute._id
  })

  const filters = reactive<IStatsFilters>({ ...EMPTY_FILTERS })
  const state = ref<StatsState>('loading')
  const errorMessage = ref('')
  const generatedAt = ref<string | null>(null)

  const globals = ref<IStatsGlobals>({
    n: 0,
    mean: null,
    std: null,
    min: null,
    max: null,
    wellbeing: null,
  })
  const population = ref<IStatsPopulation>({
    respondents: 0,
    totalStudents: null,
    coveragePct: null,
  })
  const privacy = ref<IStatsPrivacy>({
    minGroupSize: DEFAULT_MIN_GROUP_SIZE,
    sampleSufficient: true,
    hiddenCpCount: 0,
    hiddenCpAnswers: 0,
  })
  const filterOptions = ref<IStatsFilterOptions>({
    campus: [],
    department: [],
    gender: [],
  })
  const distribution = ref<IScoreBucket[]>([])
  const bands = ref<IStatsBand[]>([])
  const dimensions = ref<IStatsDimension[]>([])
  const zones = ref<IStatsZone[]>([])
  const wellbeingDelta = ref<number | null>(null)
  const respondentsDelta = ref<number | null>(null)
  const savedViews = ref<ISavedStatsView[]>([])

  /** Serie mensual y cortes por grupo, para el detalle de una dimensión. */
  const resultStats = ref<IInstituteResultStatsResponse | null>(null)

  /**
   * Cuántas respuestas quedarían al ampliar el periodo. Alimenta el botón
   * "Ampliar a 90 días · N respuestas" del estado de muestra insuficiente, para
   * que la salida propuesta no sea una promesa a ciegas.
   */
  const widerPeriodCount = ref<number | null>(null)

  /** El periodo que propone el botón de salida del estado de muestra corta. */
  const widerPeriod = ref<ReturnType<typeof nextWiderPeriod>>(null)

  const hasActiveCuts = computed(() =>
    Boolean(
      filters.campus ||
      filters.department ||
      filters.ageRange ||
      filters.gender,
    ),
  )

  const coverage = computed(() => population.value.coveragePct ?? 0)

  async function fetchAnalytics() {
    const params = buildAnalyticsParams(filters, instituteId.value)

    const [summary, demographic] = await Promise.all([
      $statsApi.get<IAnalyticsSummaryResponse>(analyticsPath('summary'), {
        params,
      }),
      $statsApi.get<IAnalyticsDemographicResponse>(
        analyticsPath('demographic'),
        { params },
      ),
    ])

    return { summary: summary.data, demographic: demographic.data }
  }

  /**
   * El cambio contra el periodo anterior y la historia por dimensión no viven
   * en el servicio de analítica. Si esa llamada falla, el tablero se dibuja sin
   * deltas en vez de quedarse en blanco: los números del periodo ya llegaron.
   */
  async function fetchResultStats() {
    if (!instituteId.value) return null

    try {
      const { data } = await $axios.get<IInstituteResultStatsResponse>(
        `/questionnaire-result/institute/${instituteId.value}/stats`,
        { params: buildResultStatsParams(filters) },
      )
      return data
    } catch (error) {
      console.error('No se pudieron cargar las comparativas del periodo', error)
      return null
    }
  }

  async function load() {
    state.value = 'loading'
    errorMessage.value = ''

    try {
      const [{ summary, demographic }, comparisons] = await Promise.all([
        fetchAnalytics(),
        fetchResultStats(),
      ])

      resultStats.value = comparisons
      generatedAt.value =
        summary.generated_at ?? demographic.generated_at ?? null

      globals.value = {
        n: summary.global_stats?.n ?? 0,
        mean: summary.global_stats?.mean ?? null,
        std: summary.global_stats?.std ?? null,
        min: summary.global_stats?.min ?? null,
        max: summary.global_stats?.max ?? null,
        wellbeing: summary.global_stats?.bienestar_promedio_1_5 ?? null,
      }

      population.value = {
        respondents: summary.population?.respondents ?? globals.value.n,
        totalStudents: summary.population?.total_students ?? null,
        coveragePct: summary.population?.coverage_pct ?? null,
      }

      privacy.value = {
        minGroupSize: summary.privacy?.min_group_size ?? DEFAULT_MIN_GROUP_SIZE,
        sampleSufficient: summary.privacy?.sample_sufficient ?? true,
        hiddenCpCount: demographic.privacy?.hidden_cp_count ?? 0,
        hiddenCpAnswers: demographic.privacy?.hidden_cp_answers ?? 0,
      }

      if (summary.filter_options) filterOptions.value = summary.filter_options

      distribution.value = buildDistribution(summary.score_distribution)
      bands.value = buildBands(distribution.value)
      dimensions.value = buildDimensions(
        summary.subscale_avg,
        comparisons?.deltas.subscales,
      )
      zones.value = demographic.cp_map ?? []
      wellbeingDelta.value = comparisons?.deltas.meanWellbeing ?? null
      respondentsDelta.value = comparisons?.deltas.n ?? null

      state.value = resolveState()
      if (state.value === 'insufficient-sample') await probeWiderPeriod()
    } catch (error) {
      console.error('Error cargando las estadísticas del instituto', error)
      errorMessage.value =
        'No pudimos cargar tus estadísticas. Intenta de nuevo.'
      state.value = 'error'
    }
  }

  /**
   * Distingue "todavía no hay población" de "este cruce dejó a poca gente".
   * Son problemas distintos y el diseño les da salidas distintas: recordar a
   * quienes faltan, o quitar un filtro.
   */
  function resolveState(): StatsState {
    const enoughForPrivacy = globals.value.n >= privacy.value.minGroupSize

    if (!enoughForPrivacy && hasActiveCuts.value) return 'insufficient-sample'

    // La cobertura solo habla de la institución completa. Con un corte puesto
    // un porcentaje bajo no significa "todavía no arranca el programa", sino
    // "este corte es angosto", y ese caso ya lo cubre el estado de arriba.
    const belowOpeningCoverage =
      !hasActiveCuts.value &&
      population.value.totalStudents !== null &&
      coverage.value < MIN_COVERAGE_TO_OPEN_PCT

    if (!enoughForPrivacy || belowOpeningCoverage) return 'first-period'

    return 'ready'
  }

  /**
   * Cuántas respuestas quedarían al pasar al siguiente periodo más largo.
   * Solo pide el resumen: el demográfico trae el mapa y las filas por alumno,
   * y aquí hace falta un número para poner en un botón.
   */
  async function probeWiderPeriod() {
    widerPeriodCount.value = null
    widerPeriod.value = nextWiderPeriod(filters.days)
    if (!widerPeriod.value) return

    try {
      const { data } = await $statsApi.get<IAnalyticsSummaryResponse>(
        analyticsPath('summary'),
        {
          params: buildAnalyticsParams(
            { ...filters, days: widerPeriod.value.days },
            instituteId.value,
          ),
        },
      )
      widerPeriodCount.value = data.global_stats?.n ?? 0
    } catch (error) {
      console.error(
        'No se pudo estimar la muestra del periodo más largo',
        error,
      )
      widerPeriod.value = null
    }
  }

  function applyFilters(next: Partial<IStatsFilters>) {
    Object.assign(filters, next)
    return load()
  }

  function clearFilters() {
    Object.assign(filters, { ...EMPTY_FILTERS, days: filters.days })
    return load()
  }

  function removeFilter(key: keyof IStatsFilters) {
    if (key === 'days') return applyFilters({ days: EMPTY_FILTERS.days })
    return applyFilters({ [key]: null } as Partial<IStatsFilters>)
  }

  /**
   * Detalle de una dimensión: su historia mensual y en qué grupo está más baja.
   * Se arma con lo que ya trajo `resultStats`, así que abrirlo no pide red.
   */
  function dimensionDetail(key: string): IDimensionDetail | null {
    const dimension = dimensions.value.find((entry) => entry.key === key)
    if (!dimension) return null

    const timeline = (resultStats.value?.subscaleTimeline ?? []).map(
      (point) => {
        const match = point.subscales.find((subscale) => subscale.key === key)
        return {
          month: monthLabel(point.month),
          average: match?.average ?? null,
          n: match?.n ?? 0,
        }
      },
    )

    const byGroup = (resultStats.value?.subscaleByStudyYear ?? [])
      .map((entry) => {
        const match = entry.subscales.find((subscale) => subscale.key === key)
        return match
          ? {
              group: entry.group,
              label: STUDY_YEAR_LABELS[entry.group] ?? `Año ${entry.group}`,
              average: match.average,
              n: match.n,
            }
          : null
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((a, b) => a.average - b.average)

    return { ...dimension, timeline, byGroup }
  }

  async function exportCsv() {
    const params = buildAnalyticsParams(filters, instituteId.value)
    const { data } = await $statsApi.get<Blob>(analyticsPath('export.csv'), {
      params,
      responseType: 'blob',
    })

    const url = URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = `kairos-estadisticas-${toIsoDate(new Date())}.csv`
    link.click()

    // Revocar en el mismo tick cancela la descarga en algunos navegadores:
    // el click solo la encola. Se libera cuando ya arrancó.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function loadSavedViews() {
    if (!instituteId.value) return

    try {
      const { data } = await $axios.get<{ views: ISavedStatsView[] }>(
        `/stats-view/institute/${instituteId.value}`,
      )
      savedViews.value = data.views ?? []
    } catch (error) {
      console.error('No se pudieron cargar las vistas guardadas', error)
    }
  }

  async function saveView(name: string) {
    if (!instituteId.value) return

    const { data } = await $axios.post<ISavedStatsView>('/stats-view', {
      instituteId: instituteId.value,
      name,
      filters: { ...filters },
    })

    // Guardar con un nombre existente lo actualiza en el servidor; aquí se
    // refleja igual para no dejar dos entradas con el mismo nombre en pantalla.
    savedViews.value = [
      data,
      ...savedViews.value.filter((view) => view.id !== data.id),
    ]
  }

  async function deleteView(id: string) {
    await $axios.delete(`/stats-view/${id}`)
    savedViews.value = savedViews.value.filter((view) => view.id !== id)
  }

  function applySavedView(view: ISavedStatsView) {
    return applyFilters({ ...EMPTY_FILTERS, ...view.filters })
  }

  return {
    filters,
    state,
    errorMessage,
    generatedAt,
    globals,
    population,
    privacy,
    filterOptions,
    distribution,
    bands,
    dimensions,
    zones,
    wellbeingDelta,
    respondentsDelta,
    widerPeriodCount,
    widerPeriod,
    savedViews,
    resultStats,
    hasActiveCuts,
    coverage,
    load,
    applyFilters,
    clearFilters,
    removeFilter,
    dimensionDetail,
    exportCsv,
    loadSavedViews,
    saveView,
    deleteView,
    applySavedView,
  }
}
