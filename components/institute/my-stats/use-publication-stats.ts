import { isAxiosError } from 'axios'
import { useAuthStore } from '~/store/auth'
import type { IInstituteQuizListResponse } from '~/interfaces/quizzes/institute-quiz.interface'
import type { QuestionnaireDefinition } from '~/interfaces/quizzes/quiz-builder.interface'
import type { StatisticsPeriod } from '~/interfaces/stats/statistics-period.interface'
import type { StatisticsPeriodsResponse } from '~/dto/response/stats/statistics-period.response.dto'
import type {
  PublicationLabels,
  StatisticsPublicationResponse,
} from '~/interfaces/stats/statistics-publication.interface'
import {
  parseStatisticsPublication,
  validDefinitionRevision,
} from '~/utils/helpers/statistics-publication'

interface CatalogItem {
  id: string
  title: string
  revision: number
  active: boolean
}
const emptyLabels = (): PublicationLabels => ({ questions: {}, metrics: {} })
function errorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 401)
      return 'Tu sesión ya no es válida. Vuelve a iniciar sesión.'
    if (error.response?.status === 403)
      return 'Tu cuenta no tiene acceso a estas estadísticas.'
    const messages: Record<string, string> = {
      statistics_period_unavailable:
        'El período debe estar registrado y haber terminado. Actualiza los períodos disponibles.',
      statistics_unclassified_population:
        'No podemos verificar la separación entre alumnos reales y demos en las entregas. Es necesario revisar esos datos antes de publicar.',
      statistics_incompatible_data:
        'Las entregas contienen revisiones o datos incompatibles. No se publicó un informe parcial.',
      statistics_publication_unavailable:
        'No pudimos verificar o guardar el informe. Puedes volver a consultarlo; no se mostrará una versión provisional.',
      statistics_busy:
        'Hay otra consulta en curso. Espera un momento e inténtalo de nuevo.',
      statistics_limit_exceeded:
        'El informe supera los límites de procesamiento. Contacta al equipo KAIROS; no se mostraron resultados parciales.',
      statistics_timeout:
        'La consulta excedió el tiempo disponible. Inténtalo de nuevo.',
    }
    const code: unknown = error.response?.data?.code
    if (typeof code === 'string' && messages[code]) return messages[code]!
  }
  return 'No pudimos obtener o verificar la información. Comprueba que los servicios estén disponibles e inténtalo de nuevo.'
}

export function usePublicationStats() {
  const auth = useAuthStore()
  const { $axios, $statsApi } = useNuxtApp()
  const institutionId = computed(() =>
    typeof auth.activeInstitute === 'string'
      ? auth.activeInstitute
      : auth.activeInstitute?._id,
  )
  const catalog = ref<CatalogItem[]>([])
  const periods = ref<StatisticsPeriod[]>([])
  const questionnaireId = ref('')
  const revisionMode = ref('current')
  const previousRevision = ref('')
  const periodKey = ref('')
  const loading = ref(false)
  const consulting = ref(false)
  const loadError = ref('')
  const queryError = ref('')
  const result = shallowRef<StatisticsPublicationResponse | null>(null)
  const labels = ref<PublicationLabels>(emptyLabels())
  const selected = computed(() =>
    catalog.value.find((q) => q.id === questionnaireId.value),
  )
  const revision = computed(() =>
    revisionMode.value === 'current'
      ? String(selected.value?.revision ?? '')
      : previousRevision.value,
  )
  const selectedPeriod = computed(() =>
    periods.value.find((p) => p.from === periodKey.value && p.closed),
  )
  const closedPeriods = computed(() => periods.value.filter((p) => p.closed))
  const revisionValid = computed(
    () =>
      validDefinitionRevision(revision.value) &&
      !!selected.value &&
      Number(revision.value) <= selected.value.revision,
  )
  const canConsult = computed(
    () =>
      !loading.value &&
      !consulting.value &&
      !loadError.value &&
      !!selected.value &&
      !!selectedPeriod.value &&
      revisionValid.value,
  )
  let contextVersion = 0
  let queryVersion = 0
  let catalogRequest: AbortController | undefined
  let reportRequest: AbortController | undefined
  function clearReport() {
    queryVersion++
    reportRequest?.abort()
    consulting.value = false
    result.value = null
    labels.value = emptyLabels()
    queryError.value = ''
  }
  async function load() {
    const current = ++contextVersion
    catalogRequest?.abort()
    clearReport()
    const controller = new AbortController()
    catalogRequest = controller
    loading.value = true
    loadError.value = ''
    catalog.value = []
    periods.value = []
    questionnaireId.value = ''
    periodKey.value = ''
    previousRevision.value = ''
    revisionMode.value = 'current'
    try {
      if (
        !institutionId.value ||
        !auth.isAuthenticated ||
        auth.isStudentPreview
      )
        throw new Error('Invalid context')
      const session = await auth.validateStatisticsSession(controller.signal)
      if (current !== contextVersion) return
      const [periodResponse, catalogResponse] = await Promise.all([
        $statsApi.get<StatisticsPeriodsResponse>('/v1/statistics/periods', {
          signal: controller.signal,
        }),
        $axios.get<IInstituteQuizListResponse>('/questionnaire', {
          params: { institutionId: session.institutionId },
          signal: controller.signal,
          timeout: 15000,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        }),
      ])
      if (current !== contextVersion) return
      const list = periodResponse.data.periods
      if (
        !Array.isArray(list) ||
        list.length > 120 ||
        list.some(
          (p) =>
            !p ||
            typeof p.closed !== 'boolean' ||
            !Number.isFinite(Date.parse(p.from)) ||
            !Number.isFinite(Date.parse(p.until)) ||
            Date.parse(p.from) >= Date.parse(p.until),
        )
      )
        throw new Error('Invalid periods')
      const items = catalogResponse.data.questionnaires
      if (!Array.isArray(items) || items.length > 1000)
        throw new Error('Invalid catalog')
      const compatible = items.filter(
        (q) => q.schemaVersion === 2 && q.status === 'published',
      )
      if (
        compatible.some(
          (q) =>
            !/^[a-f0-9]{24}$/.test(q.id) ||
            typeof q.title !== 'string' ||
            !Number.isSafeInteger(q.revision) ||
            q.revision! < 0,
        )
      )
        throw new Error('Invalid questionnaire')
      catalog.value = compatible.map((q) => ({
        id: q.id,
        title: q.title,
        revision: q.revision!,
        active: q.active,
      }))
      periods.value = list
      questionnaireId.value = catalog.value[0]?.id || ''
      periodKey.value = list.filter((p) => p.closed).at(-1)?.from || ''
    } catch (error) {
      if (current === contextVersion) loadError.value = errorMessage(error)
    } finally {
      if (current === contextVersion) loading.value = false
    }
  }
  async function consult() {
    if (!canConsult.value || !selectedPeriod.value || !institutionId.value)
      return
    clearReport()
    const current = queryVersion
    const query = {
      institutionId: institutionId.value,
      questionnaireId: questionnaireId.value,
      definitionRevision: revision.value,
      from: selectedPeriod.value.from,
      until: selectedPeriod.value.until,
    }
    const currentRevision = String(selected.value!.revision)
    const controller = new AbortController()
    reportRequest = controller
    consulting.value = true
    try {
      await auth.validateStatisticsSession(controller.signal)
      if (current !== queryVersion) return
      const { data } = await $statsApi.get<unknown>(
        `/v1/statistics/questionnaires/${query.questionnaireId}`,
        {
          params: {
            definitionRevision: query.definitionRevision,
            from: query.from,
            until: query.until,
          },
          signal: controller.signal,
        },
      )
      if (current !== queryVersion) return
      const parsed = parseStatisticsPublication(data, query)
      // Labels are optional metadata, never scores; do not attach today's labels to an old revision.
      if (
        parsed.status === 'evaluated' &&
        [...parsed.report.metrics, ...parsed.report.questions].some(
          (item) => !item.label?.trim(),
        ) &&
        query.definitionRevision === currentRevision
      ) {
        try {
          const { data: definition } =
            await $axios.get<QuestionnaireDefinition>(
              `/questionnaire/${query.questionnaireId}/definition`,
              {
                signal: controller.signal,
                timeout: 5000,
                headers: { Authorization: `Bearer ${auth.accessToken}` },
              },
            )
          if (current !== queryVersion) return
          if (
            definition._id === query.questionnaireId &&
            String(definition.__v) === query.definitionRevision
          ) {
            const names = emptyLabels()
            for (const q of definition.questions || [])
              if (typeof q.text === 'string') names.questions[q._id] = q.text
            for (const m of definition.evaluationConfiguration?.dimensions ||
              [])
              if (typeof m.label === 'string') names.metrics[m._id] = m.label
            const overall = definition.evaluationConfiguration?.overall
            if (overall && typeof overall.label === 'string')
              names.metrics[overall._id] = overall.label
            labels.value = names
          }
        } catch {
          /* The immutable report remains usable without current-definition labels. */
        }
      }
      if (current === queryVersion) result.value = parsed
    } catch (error) {
      if (current === queryVersion) queryError.value = errorMessage(error)
    } finally {
      if (current === queryVersion) consulting.value = false
    }
  }
  watch(
    questionnaireId,
    () => {
      revisionMode.value = 'current'
      previousRevision.value = ''
      clearReport()
    },
    { flush: 'sync' },
  )
  watch([revisionMode, previousRevision, periodKey], clearReport, {
    flush: 'sync',
  })
  watch(
    [
      institutionId,
      () => auth.accessToken,
      () => auth.user?._id || auth.user?.id,
      () => auth.institutionContextMode,
    ],
    () => {
      void load()
    },
    { immediate: true, flush: 'sync' },
  )
  onBeforeUnmount(() => {
    contextVersion++
    catalogRequest?.abort()
    clearReport()
  })
  return {
    catalog,
    periods,
    closedPeriods,
    questionnaireId,
    selected,
    revisionMode,
    previousRevision,
    revision,
    revisionValid,
    periodKey,
    selectedPeriod,
    loading,
    consulting,
    loadError,
    queryError,
    result,
    labels,
    canConsult,
    load,
    consult,
  }
}
