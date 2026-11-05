import { isAxiosError } from 'axios'
import { useAuthStore } from '~/store/auth'
import type { RegistrationInstitute } from '~/interfaces/institution/registration-institute.interface'
import type {
  IInstituteQuizListItem,
  IInstituteQuizListResponse,
} from '~/interfaces/quizzes/institute-quiz.interface'
import type { QuestionnaireDefinition } from '~/interfaces/quizzes/quiz-builder.interface'
import type {
  DemoInspection,
  DemoProfile,
  DemoReport,
  DemoSubmission,
} from '~/interfaces/stats/demo.interface'
import type { PublicationLabels } from '~/interfaces/stats/statistics-publication.interface'
import {
  defaultDemoProfile,
  demoID,
  newDemoSeed,
  parseDemoInspection,
  parseDemoJob,
  parseDemoReport,
  validDemoProfile,
} from '~/utils/helpers/demo'
import { demoError } from '~/utils/translations/demo'

export function useDemoSetup() {
  const { $axios, $statsApi } = useNuxtApp()
  const auth = useAuthStore()
  const institutions = ref<RegistrationInstitute[]>([])
  const institutionId = ref('')
  const questionnaireId = ref('')
  const catalog = ref<IInstituteQuizListItem[]>([])
  const inspection = shallowRef<DemoInspection | null>(null)
  const report = shallowRef<DemoReport | null>(null)
  const definition = shallowRef<QuestionnaireDefinition | null>(null)
  const labels = ref<PublicationLabels>({ questions: {}, metrics: {} })
  const defaultProfile = ref<DemoProfile>(defaultDemoProfile())
  const dimensionProfiles = ref<Record<string, DemoProfile>>({})
  const loadingInstitutions = ref(false)
  const loadingCatalog = ref(false)
  const loading = ref(false)
  const writing = ref(false)
  const assignmentBusy = ref(false)
  const reportLoading = ref(false)
  const error = ref('')
  const directoryError = ref('')
  const reportError = ref('')
  const message = ref('')
  // Keep the exact request after an uncertain outcome. Never persist tokens or
  // generate another seed/version automatically after a timeout.
  const pending = shallowRef<DemoSubmission | null>(null)
  const cancellationUncertain = ref(false)
  const selectedInstitution = computed(() =>
    institutions.value.find((i) => i._id === institutionId.value),
  )
  const selectedQuestionnaire = computed(() =>
    catalog.value.find((q) => q.id === questionnaireId.value),
  )
  const locked = computed(
    () =>
      writing.value ||
      assignmentBusy.value ||
      !!pending.value ||
      cancellationUncertain.value,
  )
  const job = computed(() => inspection.value?.state.job)
  const inProgress = computed(
    () =>
      !!job.value &&
      ['queued', 'running', 'prepared'].includes(job.value.state),
  )
  const overLimit = computed(
    () =>
      !!inspection.value &&
      inspection.value.assignment.count > inspection.value.maxParticipants,
  )
  const dimensionName = (id: string, index: number) =>
    labels.value.metrics[id] || `Dimensión ${index + 1} · ${id}`
  const overlapping = computed(() => {
    const groups = definition.value?.evaluationConfiguration.dimensions || []
    const seen = new Set<string>()
    for (const dimension of groups.filter(
      (d) => !!dimensionProfiles.value[d._id],
    )) {
      for (const item of dimension.items) {
        if (seen.has(item.questionId)) return true
        seen.add(item.questionId)
      }
    }
    return false
  })
  const canSubmit = computed(
    () =>
      !!inspection.value &&
      !locked.value &&
      !loading.value &&
      !reportLoading.value &&
      !error.value &&
      !overLimit.value &&
      !inProgress.value &&
      !inspection.value.state.cleanupPending &&
      !overlapping.value &&
      validDemoProfile(defaultProfile.value) &&
      Object.values(dimensionProfiles.value).every(validDemoProfile) &&
      inspection.value.state.latestVersion < Number.MAX_SAFE_INTEGER,
  )
  let contextVersion = 0
  let inspectionVersion = 0
  let reportVersion = 0
  let directoryController: AbortController | undefined
  let readController: AbortController | undefined
  let reportController: AbortController | undefined
  let catalogController: AbortController | undefined
  const headers = (id = institutionId.value) => ({ 'X-Kairos-Institution': id })
  const endpoint = () => `/v1/demos/questionnaires/${questionnaireId.value}`
  function clearReport() {
    reportVersion++
    reportController?.abort()
    report.value = null
    reportError.value = ''
    reportLoading.value = false
  }
  function resetQuestionnaire() {
    inspectionVersion++
    readController?.abort()
    clearReport()
    inspection.value = null
    definition.value = null
    labels.value = { questions: {}, metrics: {} }
    defaultProfile.value = defaultDemoProfile()
    dimensionProfiles.value = {}
    error.value = ''
    message.value = ''
    loading.value = false
  }
  async function loadInstitutions() {
    directoryController?.abort()
    const controller = new AbortController()
    directoryController = controller
    loadingInstitutions.value = true
    directoryError.value = ''
    try {
      const { data } = await $axios.get<RegistrationInstitute[]>(
        '/institute/registration-directory',
        { signal: controller.signal, timeout: 15000 },
      )
      if (controller.signal.aborted) return
      if (
        !Array.isArray(data) ||
        data.some(
          (i) =>
            !demoID(i._id) ||
            typeof i.name !== 'string' ||
            typeof i.active !== 'boolean',
        )
      )
        throw new Error('Invalid directory')
      institutions.value = data
    } catch (cause) {
      if (!controller.signal.aborted) directoryError.value = demoError(cause)
    } finally {
      if (!controller.signal.aborted) loadingInstitutions.value = false
    }
  }
  async function loadCatalog() {
    const current = ++contextVersion
    catalogController?.abort()
    resetQuestionnaire()
    catalog.value = []
    questionnaireId.value = ''
    loadingCatalog.value = false
    if (!demoID(institutionId.value) || !selectedInstitution.value?.active)
      return
    const controller = new AbortController()
    catalogController = controller
    loadingCatalog.value = true
    try {
      const { data } = await $axios.get<IInstituteQuizListResponse>(
        '/questionnaire',
        {
          params: { institutionId: institutionId.value },
          signal: controller.signal,
          timeout: 15000,
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
          q.active &&
          q.status === 'published' &&
          typeof q.title === 'string',
      )
    } catch (cause) {
      if (current === contextVersion) error.value = demoError(cause)
    } finally {
      if (current === contextVersion) loadingCatalog.value = false
    }
  }
  async function loadInspection(restoreControls = false) {
    if (
      !demoID(institutionId.value) ||
      !demoID(questionnaireId.value) ||
      writing.value ||
      assignmentBusy.value
    )
      return
    const current = ++inspectionVersion
    readController?.abort()
    clearReport()
    const controller = new AbortController()
    readController = controller
    const q = questionnaireId.value,
      institution = institutionId.value
    loading.value = true
    error.value = ''
    try {
      const { data } = await $statsApi.get<unknown>(endpoint(), {
        headers: headers(institution),
        signal: controller.signal,
      })
      if (current !== inspectionVersion) return
      const parsed = parseDemoInspection(data, q)
      inspection.value = parsed
      // Definition labels only annotate the current revision, never supply scores.
      definition.value = null
      labels.value = { questions: {}, metrics: {} }
      try {
        const { data: d } = await $axios.get<QuestionnaireDefinition>(
          `/questionnaire/${q}/definition`,
          { signal: controller.signal, timeout: 5000 },
        )
        if (current !== inspectionVersion) return
        if (
          d._id === q &&
          String(d.__v) === parsed.revision.definitionRevision &&
          Array.isArray(d.questions) &&
          d.questions.length <= 100 &&
          Array.isArray(d.evaluationConfiguration?.dimensions) &&
          d.evaluationConfiguration.dimensions.length <= 32
        ) {
          definition.value = d
          for (const item of d.questions)
            if (typeof item.text === 'string')
              labels.value.questions[item._id] = item.text
          for (const item of d.evaluationConfiguration.dimensions)
            if (typeof item.label === 'string')
              labels.value.metrics[item._id] = item.label
          const overall = d.evaluationConfiguration.overall
          if (overall && typeof overall.label === 'string')
            labels.value.metrics[overall._id] = overall.label
        }
      } catch {
        /* Optional labels; the authoritative API still validates controls. */
      }
      if (current !== inspectionVersion) return
      if (restoreControls) {
        const previous = parsed.state.configurations.at(-1)
        defaultProfile.value = previous
          ? { ...previous.controls.default }
          : defaultDemoProfile()
        dimensionProfiles.value = {}
        for (const d of previous?.controls.dimensions || [])
          if (parsed.dimensionIds.includes(d.dimensionId))
            dimensionProfiles.value[d.dimensionId] = { ...d.profile }
      }
      cancellationUncertain.value = false
    } catch (cause) {
      if (current === inspectionVersion) {
        inspection.value = null
        error.value = demoError(cause)
      }
    } finally {
      if (current === inspectionVersion) loading.value = false
    }
  }
  async function submit() {
    if (
      (!pending.value && !canSubmit.value) ||
      writing.value ||
      assignmentBusy.value ||
      loading.value ||
      reportLoading.value
    )
      return
    if (!pending.value && inspection.value) {
      try {
        pending.value = {
          assignmentId: inspection.value.assignment.id,
          assignmentRevision: inspection.value.assignment.revision,
          version: inspection.value.state.latestVersion + 1,
          definitionRevision: inspection.value.revision.definitionRevision,
          definitionFingerprint: inspection.value.definitionFingerprint,
          controls: {
            seed: newDemoSeed(),
            default: { ...defaultProfile.value },
            dimensions: Object.entries(dimensionProfiles.value)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([dimensionId, profile]) => ({
                dimensionId,
                profile: { ...profile },
              })),
          },
        }
      } catch {
        error.value =
          'No pudimos preparar una nueva simulación. Abre la aplicación en una conexión segura y vuelve a intentarlo.'
        return
      }
    }
    const body = pending.value
    if (!body) return
    const token = auth.accessToken,
      institution = institutionId.value,
      questionnaire = questionnaireId.value
    const unchanged = () =>
      token === auth.accessToken &&
      institution === institutionId.value &&
      questionnaire === questionnaireId.value
    writing.value = true
    error.value = ''
    message.value = ''
    try {
      const { data } = await $statsApi.post<unknown>(
        `${endpoint()}/jobs`,
        body,
        { headers: headers() },
      )
      if (!unchanged()) return
      const result = parseDemoJob(data)
      if (result.configVersion !== body.version)
        throw new Error('Unexpected job')
      pending.value = null
      message.value =
        result.state === 'queued'
          ? 'Solicitud guardada. La demo está en espera de ejecución por el equipo KAIROS.'
          : 'Solicitud confirmada. Consulta el estado del trabajo.'
    } catch (cause) {
      if (!unchanged()) return
      error.value = demoError(cause)
      if (
        isAxiosError(cause) &&
        cause.response &&
        [400, 401, 403, 409, 413, 415, 422, 429].includes(cause.response.status)
      )
        pending.value = null
    } finally {
      writing.value = false
    }
    if (!pending.value) {
      const actionError = error.value
      await loadInspection()
      if (actionError) error.value = actionError
    }
  }
  async function cancelJob() {
    if (
      !inspection.value ||
      !job.value ||
      !inProgress.value ||
      locked.value ||
      loading.value ||
      reportLoading.value
    )
      return
    writing.value = true
    error.value = ''
    message.value = ''
    const id = job.value.id
    const token = auth.accessToken,
      institution = institutionId.value,
      questionnaire = questionnaireId.value
    const unchanged = () =>
      token === auth.accessToken &&
      institution === institutionId.value &&
      questionnaire === questionnaireId.value
    try {
      const { data } = await $statsApi.post<unknown>(
        `${endpoint()}/cancel`,
        { assignmentId: inspection.value.assignment.id, jobId: id },
        { headers: headers() },
      )
      if (!unchanged()) return
      const result = parseDemoJob(data)
      if (result.id !== id || result.state !== 'cancelled')
        throw new Error('Unexpected cancellation')
      message.value =
        'Trabajo cancelado. La generación activa se conserva; el equipo KAIROS completará la limpieza pendiente.'
    } catch (cause) {
      if (!unchanged()) return
      error.value = demoError(cause)
      cancellationUncertain.value = true
    } finally {
      writing.value = false
    }
    const actionError = error.value
    await loadInspection()
    if (actionError) error.value = actionError
  }
  async function consult() {
    if (
      !inspection.value?.state.activeGenerationId ||
      locked.value ||
      loading.value ||
      reportLoading.value
    )
      return
    clearReport()
    const current = reportVersion
    const expected = inspection.value
    const controller = new AbortController()
    reportController = controller
    reportLoading.value = true
    try {
      const { data } = await $statsApi.get<unknown>(`${endpoint()}/report`, {
        headers: headers(),
        signal: controller.signal,
      })
      if (current === reportVersion)
        report.value = parseDemoReport(data, expected)
    } catch (cause) {
      if (current === reportVersion) reportError.value = demoError(cause)
    } finally {
      if (current === reportVersion) reportLoading.value = false
    }
  }
  function toggleDimension(id: string, enabled: boolean) {
    if (enabled) dimensionProfiles.value[id] = { ...defaultProfile.value }
    else
      dimensionProfiles.value = Object.fromEntries(
        Object.entries(dimensionProfiles.value).filter(([key]) => key !== id),
      )
  }
  function assignmentChanged() {
    resetQuestionnaire()
    void loadInspection(true)
  }
  async function stopRetrying() {
    if (writing.value) return
    pending.value = null
    cancellationUncertain.value = false
    message.value =
      'Se dejó de reintentar. La solicitud puede haberse guardado; comprueba el estado antes de pedir otra generación.'
    await loadInspection()
  }
  watch(institutionId, loadCatalog)
  watch(questionnaireId, () => {
    resetQuestionnaire()
    void loadInspection(true)
  })
  watch(
    () => auth.accessToken,
    () => {
      contextVersion++
      catalogController?.abort()
      pending.value = null
      cancellationUncertain.value = false
      resetQuestionnaire()
      error.value = 'La sesión cambió. Actualiza el estado antes de continuar.'
    },
  )
  onBeforeRouteLeave(() => {
    if (
      writing.value ||
      assignmentBusy.value ||
      pending.value ||
      cancellationUncertain.value
    ) {
      message.value =
        'Confirma el resultado de la operación antes de salir. Puedes reintentar la misma solicitud o actualizar el estado.'
      return false
    }
  })
  onMounted(loadInstitutions)
  onBeforeUnmount(() => {
    contextVersion++
    inspectionVersion++
    clearReport()
    directoryController?.abort()
    catalogController?.abort()
    readController?.abort()
  })
  return {
    institutions,
    institutionId,
    questionnaireId,
    catalog,
    inspection,
    report,
    labels,
    defaultProfile,
    dimensionProfiles,
    loadingInstitutions,
    loadingCatalog,
    loading,
    writing,
    assignmentBusy,
    reportLoading,
    error,
    directoryError,
    reportError,
    message,
    pending,
    cancellationUncertain,
    selectedInstitution,
    selectedQuestionnaire,
    locked,
    job,
    inProgress,
    overLimit,
    overlapping,
    canSubmit,
    dimensionName,
    loadInstitutions,
    loadCatalog,
    loadInspection,
    submit,
    cancelJob,
    consult,
    toggleDimension,
    assignmentChanged,
    stopRetrying,
  }
}
