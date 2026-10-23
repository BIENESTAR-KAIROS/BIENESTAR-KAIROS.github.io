import { useAuthStore } from '~/store/auth'
import { getApiErrorMessage } from '~/utils/helpers/http-errors'
import type {
  QuestionnaireStatsOption,
  QuestionnaireStatsResponse,
} from '~/interfaces/stats/questionnaire-stats.interface'

export function useQuestionnaireStats() {
  const { $statsApi } = useNuxtApp()
  const auth = useAuthStore()
  const instituteId = computed(() => {
    const institute = auth.activeInstitute
    return typeof institute === 'string' ? institute : institute?._id
  })
  const questionnaires = ref<QuestionnaireStatsOption[]>([])
  const selected = ref('')
  const revision = ref('')
  const response = ref<QuestionnaireStatsResponse | null>(null)
  const filterOptions = ref<QuestionnaireStatsResponse['filterOptions']>({
    campus: [],
    department: [],
    gender: [],
  })
  const loading = ref(false)
  const catalogLoading = ref(false)
  const error = ref('')
  const catalogError = ref('')
  const filters = reactive({
    days: '180',
    population: 'all',
    campus: '',
    department: '',
    gender: '',
    ageRange: '',
  })
  const version = computed(() =>
    response.value?.versions.find((v) => v.key === revision.value),
  )
  let catalogRequest: AbortController | undefined
  let statsRequest: AbortController | undefined
  const basePath = () =>
    `/api/analytics/institutions/${instituteId.value}/questionnaires`

  async function loadCatalog() {
    catalogRequest?.abort()
    statsRequest?.abort()
    const controller = new AbortController()
    catalogRequest = controller
    catalogError.value = ''
    error.value = ''
    filterOptions.value = { campus: [], department: [], gender: [] }
    questionnaires.value = []
    selected.value = ''
    response.value = null
    if (!instituteId.value) {
      catalogError.value =
        'Selecciona una institución para consultar sus estadísticas.'
      catalogLoading.value = false
      return
    }
    catalogLoading.value = true
    try {
      const { data } = await $statsApi.get<{
        questionnaires: QuestionnaireStatsOption[]
      }>(basePath(), { signal: controller.signal })
      if (controller.signal.aborted) return
      questionnaires.value = data.questionnaires
      selected.value =
        data.questionnaires.find((q) => q.active)?.id ??
        data.questionnaires[0]?.id ??
        ''
    } catch (cause) {
      if (!controller.signal.aborted)
        catalogError.value = getApiErrorMessage(
          cause,
          'No pudimos cargar los cuestionarios.',
        )
    } finally {
      if (catalogRequest === controller) catalogLoading.value = false
    }
  }

  async function load() {
    statsRequest?.abort()
    const controller = new AbortController()
    statsRequest = controller
    error.value = ''
    response.value = null
    if (!selected.value || !instituteId.value) {
      loading.value = false
      return
    }
    loading.value = true
    const [ageMin, ageMax] = filters.ageRange.split(':')
    const params = {
      population: filters.population,
      campus: filters.campus || undefined,
      department: filters.department || undefined,
      gender: filters.gender || undefined,
      age_min: ageMin || undefined,
      age_max: ageMax || undefined,
      ...(filters.days
        ? {
            date_from: new Date(Date.now() - Number(filters.days) * 86400000)
              .toISOString()
              .slice(0, 10),
            date_to: new Date().toISOString().slice(0, 10),
          }
        : {}),
    }
    try {
      const { data } = await $statsApi.get<QuestionnaireStatsResponse>(
        `${basePath()}/${selected.value}/summary`,
        { params, signal: controller.signal },
      )
      if (controller.signal.aborted) return
      response.value = data
      filterOptions.value = data.filterOptions
      if (!data.versions.some((v) => v.key === revision.value))
        revision.value = data.versions[0]?.key ?? ''
    } catch (cause) {
      if (!controller.signal.aborted)
        error.value = getApiErrorMessage(
          cause,
          'No pudimos cargar las estadísticas de este cuestionario.',
        )
    } finally {
      if (statsRequest === controller) loading.value = false
    }
  }
  function clearFilters() {
    Object.assign(filters, {
      days: '',
      population: 'all',
      campus: '',
      department: '',
      gender: '',
      ageRange: '',
    })
  }
  watch(instituteId, loadCatalog, { immediate: true })
  watch([selected, filters], load, { deep: true })
  onBeforeUnmount(() => {
    catalogRequest?.abort()
    statsRequest?.abort()
  })
  return {
    questionnaires,
    filterOptions,
    selected,
    revision,
    response,
    version,
    loading,
    catalogLoading,
    error,
    catalogError,
    filters,
    load,
    loadCatalog,
    clearFilters,
  }
}
