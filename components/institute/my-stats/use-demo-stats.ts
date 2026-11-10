import { isAxiosError } from 'axios'
import { useAuthStore } from '~/store/auth'
import type {
  IInstituteQuizListItem,
  IInstituteQuizListResponse,
} from '~/interfaces/quizzes/institute-quiz.interface'
import type { QuestionnaireDefinition } from '~/interfaces/quizzes/quiz-builder.interface'
import type {
  InstitutionDemoStatus,
  InstitutionDemoReport,
} from '~/interfaces/stats/institution-demo.interface'
import type { PublicationLabels } from '~/interfaces/stats/statistics-publication.interface'
import { demoID } from '~/utils/helpers/demo'
import {
  parseInstitutionDemoStatus,
  parseInstitutionDemoReport,
} from '~/utils/helpers/institution-demo'

export function institutionDemoError(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 401)
      return 'Tu sesión ya no es válida. Vuelve a iniciar sesión.'
    if (error.response?.status === 403)
      return 'Tu cuenta no tiene acceso a las demos de esta institución.'
    const messages: Record<string, string> = {
      demo_assignment_unavailable:
        'No hay una asignación demo vigente. Si fue retirada, sus resultados dejan de estar disponibles. Solicita una nueva asignación al administrador KAIROS.',
      demo_assignment_changed:
        'La asignación cambió y sus resultados anteriores ya no corresponden a esta población. Actualiza el estado en unos momentos.',
      demo_generation_unavailable:
        'Todavía no hay una generación completa disponible. Actualiza el estado en unos momentos.',
      demo_busy:
        'Hay otra consulta demo en curso. Espera un momento y vuelve a intentarlo.',
      demo_limit_exceeded:
        'La demo supera el límite de consulta. Solicita al administrador KAIROS que revise su configuración.',
      demo_timeout:
        'La consulta tardó más de lo esperado. Vuelve a intentarlo.',
    }
    const code: unknown = error.response?.data?.code
    if (typeof code === 'string' && messages[code]) return messages[code]!
  }
  return 'No pudimos verificar los resultados demo. Comprueba la disponibilidad de los servicios y vuelve a intentarlo.'
}
export function useDemoStats() {
  const auth = useAuthStore()
  const { $axios, $statsApi } = useNuxtApp()
  const institutionId = computed(() =>
    typeof auth.activeInstitute === 'string'
      ? auth.activeInstitute
      : auth.activeInstitute?._id,
  )
  const catalog = ref<IInstituteQuizListItem[]>([])
  const questionnaireId = ref('')
  const selected = computed(() =>
    catalog.value.find((q) => q.id === questionnaireId.value),
  )
  const loading = ref(false),
    consulting = ref(false)
  const loadError = ref(''),
    queryError = ref('')
  const status = shallowRef<InstitutionDemoStatus | null>(null)
  const report = shallowRef<InstitutionDemoReport | null>(null)
  const labels = ref<PublicationLabels>({ questions: {}, metrics: {} })
  let contextVersion = 0,
    queryVersion = 0
  let catalogRequest: AbortController | undefined,
    reportRequest: AbortController | undefined
  function clear() {
    queryVersion++
    reportRequest?.abort()
    consulting.value = false
    status.value = null
    report.value = null
    labels.value = { questions: {}, metrics: {} }
    queryError.value = ''
  }
  async function load() {
    const current = ++contextVersion
    catalogRequest?.abort()
    clear()
    catalog.value = []
    questionnaireId.value = ''
    loadError.value = ''
    loading.value = true
    const controller = new AbortController()
    catalogRequest = controller
    try {
      if (
        !demoID(institutionId.value) ||
        !auth.isAuthenticated ||
        auth.isStudentPreview
      )
        throw new Error('Invalid context')
      const session = await auth.validateStatisticsSession(controller.signal)
      if (current !== contextVersion) return
      const { data } = await $axios.get<IInstituteQuizListResponse>(
        '/questionnaire',
        {
          params: { institutionId: session.institutionId },
          signal: controller.signal,
          timeout: 15000,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        },
      )
      if (current !== contextVersion) return
      if (
        !Array.isArray(data.questionnaires) ||
        data.questionnaires.length > 1000
      )
        throw new Error('Invalid catalog')
      catalog.value = data.questionnaires.filter(
        (q) =>
          demoID(q.id) &&
          q.schemaVersion === 2 &&
          q.status === 'published' &&
          q.active &&
          typeof q.title === 'string',
      )
      questionnaireId.value = catalog.value[0]?.id || ''
    } catch (error) {
      if (current === contextVersion)
        loadError.value = institutionDemoError(error)
    } finally {
      if (current === contextVersion) loading.value = false
    }
  }
  async function consult() {
    if (
      loading.value ||
      consulting.value ||
      !selected.value ||
      !demoID(institutionId.value)
    )
      return
    clear()
    const current = queryVersion,
      institution = institutionId.value,
      q = questionnaireId.value
    const controller = new AbortController()
    reportRequest = controller
    consulting.value = true
    const endpoint = `/v1/statistics/demos/questionnaires/${q}`
    try {
      await auth.validateStatisticsSession(controller.signal)
      if (current !== queryVersion) return
      const { data } = await $statsApi.get<unknown>(endpoint, {
        signal: controller.signal,
      })
      if (current !== queryVersion) return
      const state = parseInstitutionDemoStatus(data, institution, q)
      status.value = state
      if (!state.hasActiveGeneration) return
      const response = await $statsApi.get<unknown>(`${endpoint}/report`, {
        signal: controller.signal,
      })
      if (current !== queryVersion) return
      const parsed = parseInstitutionDemoReport(response.data, state)
      try {
        const { data: d } = await $axios.get<QuestionnaireDefinition>(
          `/questionnaire/${q}/definition`,
          {
            signal: controller.signal,
            timeout: 5000,
            headers: { Authorization: `Bearer ${auth.accessToken}` },
          },
        )
        if (current !== queryVersion) return
        if (
          d._id === q &&
          String(d.__v) === parsed.definitionRevision &&
          Array.isArray(d.questions) &&
          d.questions.length <= 100
        ) {
          const names: PublicationLabels = { questions: {}, metrics: {} }
          for (const item of d.questions)
            if (typeof item.text === 'string')
              names.questions[item._id] = item.text
          for (const item of d.evaluationConfiguration?.dimensions || [])
            if (typeof item.label === 'string')
              names.metrics[item._id] = item.label
          const overall = d.evaluationConfiguration?.overall
          if (overall && typeof overall.label === 'string')
            names.metrics[overall._id] = overall.label
          labels.value = names
        }
      } catch {
        /* Optional current-revision labels; never replace scores. */
      }
      if (current === queryVersion) report.value = parsed
    } catch (error) {
      if (current === queryVersion)
        queryError.value = institutionDemoError(error)
    } finally {
      if (current === queryVersion) consulting.value = false
    }
  }
  watch(questionnaireId, clear, { flush: 'sync' })
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
    clear()
  })
  return {
    catalog,
    questionnaireId,
    selected,
    loading,
    consulting,
    loadError,
    queryError,
    status,
    report,
    labels,
    load,
    consult,
  }
}
