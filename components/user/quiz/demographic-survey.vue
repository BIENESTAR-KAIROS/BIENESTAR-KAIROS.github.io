<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { useUserStore } from '~/store/user'
import {
  civilStatusTranslations,
  studyYearTranslations,
  housingSituationTranslations,
  personalMonthlyIncomeTranslations,
  familyMonthlyIncomeTranslations,
  employmentStatusTranslations,
  consumptionFrecuencyTranslations,
  physicalActivityTranslations,
} from '~/utils/constants/translations'
import { demoLabels, translateValue } from '~/utils/translations'
import type { StudentDemographicDataRequestDto } from '~/dto/request/user/user-student-demographic-data.request.dto'
import type {
  IDemographicHistoryEntry,
  IDemographicSurveyAvailability,
} from '~/interfaces/user/demographic-history.interface'

type AnswerValue = string | number | boolean

interface Question {
  key: string
  label: string
  /** Short name, used when listing what changed between two versions. */
  shortLabel: string
  placeholder: string
  /** Spanish option -> value stored in the backend. Absent for free text. */
  options?: Record<string, AnswerValue>
  /** Only asked by the institutes that opted into the extra questions. */
  extra?: boolean
}

interface Block {
  id: 'home' | 'income' | 'studies' | 'health'
  title: string
  note?: string
  questions: Question[]
}

const { $router } = useNuxtApp()
const authStore = useAuthStore()
const userStore = useUserStore()

const yesNoOptions: Record<string, AnswerValue> = { Sí: true, No: false }

// Same questions as the previous screen, word for word, grouped into the
// thematic blocks the redesign asks for.
const blocks: Block[] = [
  {
    id: 'home',
    title: 'Dónde y con quién vives',
    questions: [
      {
        key: 'zipCode',
        label: 'Código postal',
        shortLabel: 'código postal',
        placeholder: 'Escribe tu código postal',
      },
      {
        key: 'civilStatus',
        label: '¿Cuál es tu estado civil?',
        shortLabel: 'estado civil',
        placeholder: 'Selecciona una opción',
        options: civilStatusTranslations,
      },
      {
        key: 'housingSituation',
        label: '¿En donde vives actualmente?',
        shortLabel: 'dónde vives',
        placeholder: 'Selecciona una opción',
        options: housingSituationTranslations,
      },
    ],
  },
  {
    id: 'income',
    title: 'Ingresos',
    note: 'Nadie ve estas respuestas con tu nombre',
    questions: [
      {
        key: 'personalMonthlyIncome',
        label: '¿En qué rango están tus ingresos mensuales personales?',
        shortLabel: 'ingresos personales',
        placeholder: 'Elige un rango',
        options: personalMonthlyIncomeTranslations,
      },
      {
        key: 'familyMonthlyIncome',
        label: '¿En qué rango están tus ingresos mensuales familiares?',
        shortLabel: 'ingresos familiares',
        placeholder: 'Elige un rango',
        options: familyMonthlyIncomeTranslations,
      },
    ],
  },
  {
    id: 'studies',
    title: 'Estudios y trabajo',
    questions: [
      {
        key: 'studyYear',
        label: '¿En qué año de tus estudios te encuentras actualmente?',
        shortLabel: 'año de estudios',
        placeholder: 'Selecciona una opción',
        options: studyYearTranslations,
        extra: true,
      },
      {
        key: 'employmentStatus',
        label: '¿Trabajas mientras realizas tus estudios?',
        shortLabel: 'trabajo',
        placeholder: 'Selecciona una opción',
        options: employmentStatusTranslations,
        extra: true,
      },
    ],
  },
  {
    id: 'health',
    title: 'Salud y hábitos',
    questions: [
      {
        key: 'hasChronicDisease',
        label: '¿Padeces de alguna enfermedad crónica?',
        shortLabel: 'enfermedad crónica',
        placeholder: 'Selecciona una opción',
        options: yesNoOptions,
      },
      {
        key: 'nicotineProductUse',
        label:
          '¿Has usado alguna vez productos de nicotina en bolsa como Velo, Zyn, Snus (que se colocan entre el labio y la encía, sin necesidad de fumar)?',
        shortLabel: 'productos de nicotina',
        placeholder: 'Selecciona una opción',
        options: yesNoOptions,
      },
      {
        key: 'tobaccoConsumption',
        label: '¿Consumes tabaco?',
        shortLabel: 'tabaco',
        placeholder: 'Selecciona una opción',
        options: yesNoOptions,
        extra: true,
      },
      {
        key: 'alcoholConsumption',
        label: '¿Consumes alcohol?',
        shortLabel: 'alcohol',
        placeholder: 'Selecciona una opción',
        options: consumptionFrecuencyTranslations,
        extra: true,
      },
      {
        key: 'weeklyPhysicalActivity',
        label:
          '¿Cuántas horas a la semana dedicas a hacer alguna actividad física?',
        shortLabel: 'actividad física',
        placeholder: 'Selecciona una opción',
        options: physicalActivityTranslations,
      },
    ],
  },
]

const isLoading = ref(true)
const isSaving = ref(false)
const isEditing = ref(false)
const errorMessage = ref('')
const availability = ref<IDemographicSurveyAvailability | null>(null)
const historyEntries = ref<IDemographicHistoryEntry[]>([])
const expandedVersionId = ref<string | null>(null)

// Every answer is held as the Spanish option the user picked; it is translated
// to the value the backend stores only when the form is submitted.
const answers = reactive<Record<string, string>>({})
for (const block of blocks) {
  for (const question of block.questions) {
    answers[question.key] = ''
  }
}

const asksExtraQuestions = computed(() => {
  const instituteId = authStore.user?.institute?._id

  return !!instituteId && authStore.isBlockedForInstitutes.includes(instituteId)
})

const visibleBlocks = computed(() =>
  blocks
    .map((block) => ({
      ...block,
      questions: block.questions.filter(
        (question) => !question.extra || asksExtraQuestions.value,
      ),
    }))
    .filter((block) => block.questions.length > 0),
)

const visibleQuestions = computed(() =>
  visibleBlocks.value.flatMap((block) => block.questions),
)

const questionByKey = computed<Record<string, Question>>(() =>
  Object.fromEntries(
    visibleQuestions.value.map((question) => [question.key, question]),
  ),
)

const isAnswered = (question: Question) =>
  !!answers[question.key] && answers[question.key].trim() !== ''

const answeredCount = computed(
  () => visibleQuestions.value.filter(isAnswered).length,
)
const totalCount = computed(() => visibleQuestions.value.length)
const remainingCount = computed(() => totalCount.value - answeredCount.value)
const isComplete = computed(() => remainingCount.value === 0)
const progress = computed(() =>
  totalCount.value === 0
    ? 0
    : Math.round((answeredCount.value / totalCount.value) * 100),
)

const answeredInBlock = (block: Block) =>
  block.questions.filter(isAnswered).length

const activeBlockId = computed(() => {
  const pending = visibleBlocks.value.find((block) =>
    block.questions.some((question) => !isAnswered(question)),
  )

  return pending ? pending.id : null
})

// A question spans the whole row when its wording is long, or when it would
// otherwise be left alone in half a row at the end of a block.
function isWideField(block: Block, question: Question, index: number): boolean {
  if (question.label.length > 48) return true

  return (
    block.questions.length % 2 === 1 && index === block.questions.length - 1
  )
}

function blockStatus(block: Block): string {
  if (answeredInBlock(block) === block.questions.length) return 'completas'

  return block.id === activeBlockId.value ? 'sigues aquí' : 'faltan'
}

// On a phone only one block is open at a time, the way the design lays it out.
// On a wider screen every block stays open.
const isNarrow = ref(false)
const manuallyOpenedBlock = ref<string | null>(null)
let viewportQuery: MediaQueryList | null = null

function syncViewport(event: MediaQueryListEvent | MediaQueryList) {
  isNarrow.value = event.matches
}

const isBlockOpen = (block: Block) =>
  !isNarrow.value ||
  (manuallyOpenedBlock.value ?? activeBlockId.value) === block.id

function toggleBlock(block: Block) {
  if (!isNarrow.value) return

  manuallyOpenedBlock.value = isBlockOpen(block) ? null : block.id
}

const draftKey = computed(
  () => `kairos:demographic-draft:${authStore.user?._id ?? 'anon'}`,
)

function loadDraft() {
  try {
    const raw = window.localStorage.getItem(draftKey.value)

    if (!raw) return

    // Only real answers override the prefill, so a stale empty draft can never
    // wipe what the person already submitted.
    for (const [key, value] of Object.entries(JSON.parse(raw))) {
      if (typeof value === 'string' && value !== '') answers[key] = value
    }
  } catch (error) {
    // A missing or unreadable draft just means starting from a clean form.
    console.warn('No se pudo leer el borrador del cuestionario:', error)
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(draftKey.value)
  } catch (error) {
    console.warn('No se pudo limpiar el borrador del cuestionario:', error)
  }
}

watch(
  answers,
  () => {
    try {
      window.localStorage.setItem(draftKey.value, JSON.stringify(answers))
    } catch (error) {
      console.warn('No se pudo guardar el borrador del cuestionario:', error)
    }
  },
  { deep: true },
)

function formatDate(value?: string | Date | null) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** The Spanish option matching a value already stored in the backend. */
function optionLabelFor(question: Question, value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  if (!question.options) return String(value)

  const match = Object.entries(question.options).find(
    ([, stored]) => stored === value,
  )

  return match ? match[0] : null
}

function prefillFrom(data: Record<string, unknown> | null) {
  if (!data) return

  for (const question of visibleQuestions.value) {
    const label = optionLabelFor(question, data[question.key])

    if (label !== null) answers[question.key] = label
  }
}

const hasSubmitted = computed(
  () =>
    (availability.value?.totalVersions ?? 0) > 0 ||
    !!authStore.user?.studentData?.demographicSurveyCompleted,
)
const isLocked = computed(() => availability.value?.canUpdate === false)
const showForm = computed(() => !hasSubmitted.value || isEditing.value)

const lastSubmittedData = computed<Record<string, unknown> | null>(
  () =>
    historyEntries.value[0]?.demographicData ??
    authStore.user?.studentData?.demographicData ??
    null,
)

const lastUpdateLabel = computed(() =>
  formatDate(availability.value?.lastUpdatedAt),
)
const nextUpdateLabel = computed(() =>
  formatDate(availability.value?.nextUpdateAvailableAt),
)

function rowsFor(data: Record<string, unknown> | null) {
  if (!data) return []

  return Object.entries(data)
    .filter(
      ([, value]) => value !== null && value !== undefined && value !== '',
    )
    .map(([key, value]) => {
      const question = questionByKey.value[key]

      return {
        key,
        label: question?.label ?? demoLabels[key] ?? key,
        value:
          (question ? optionLabelFor(question, value) : null) ??
          translateValue(value),
      }
    })
}

const summaryRows = computed(() => rowsFor(lastSubmittedData.value))

function changeSummary(entry: IDemographicHistoryEntry): string {
  if (entry.version === 1) return 'Primer registro'

  const names = entry.changedFields.map(
    (key) =>
      questionByKey.value[key]?.shortLabel ??
      demoLabels[key]?.toLowerCase() ??
      key,
  )

  if (names.length === 0) return 'Sin cambios'
  if (names.length <= 2) return `Cambió: ${names.join(' y ')}`

  return `Cambió: ${names.slice(0, 2).join(', ')} y ${names.length - 2} más`
}

const historyItems = computed(() =>
  historyEntries.value.map((entry) => ({
    id: entry.id,
    version: entry.version,
    date: formatDate(entry.submittedAt),
    summary: changeSummary(entry),
    rows: rowsFor(entry.demographicData),
  })),
)

function toggleVersion(id: string) {
  expandedVersionId.value = expandedVersionId.value === id ? null : id
}

async function loadSurveyState() {
  try {
    const [availabilityResponse, history] = await Promise.all([
      userStore.getDemographicSurveyAvailability(),
      userStore.getDemographicHistory(),
    ])

    availability.value = availabilityResponse
    historyEntries.value = history.entries
  } catch (error) {
    console.error('Error al consultar el historial sociodemográfico:', error)
  }
}

async function goToNextPendingQuiz(): Promise<boolean> {
  const nextQuiz = userStore.user?.questionnaireQueue?.queue.find(
    (item) => !item.solved,
  )

  if (!nextQuiz) return false

  await $router.push(`/user/quiz/${nextQuiz.questionnaireId}`)

  return true
}

function markDemographicSolved() {
  const queue = userStore.user?.questionnaireQueue

  if (!queue) return

  userStore.user!.questionnaireQueue = {
    queue: queue.queue.map((item) =>
      item.questionnaireId === 'demographic' ? { ...item, solved: true } : item,
    ),
  }
}

function buildPayload(): StudentDemographicDataRequestDto {
  const payload: Record<string, AnswerValue> = {}

  for (const question of visibleQuestions.value) {
    const answer = answers[question.key]

    payload[question.key] = question.options
      ? question.options[answer]
      : answer.trim()
  }

  return payload as unknown as StudentDemographicDataRequestDto
}

function startEditing() {
  if (isLocked.value) return

  isEditing.value = true
  errorMessage.value = ''
  prefillFrom(lastSubmittedData.value)
}

async function saveAnswers() {
  if (!isComplete.value || isSaving.value) return

  isSaving.value = true
  errorMessage.value = ''

  const wasFirstSubmission = !hasSubmitted.value

  try {
    await authStore.refreshAuth()

    const response = await userStore.updateUserStudentData(
      authStore.user!._id,
      { demographicData: buildPayload() },
    )

    if (!response.passed) {
      errorMessage.value =
        'No pudimos guardar tus respuestas. Vuelve a intentarlo en un momento.'
      return
    }

    if (authStore.user?.studentData) {
      authStore.user.studentData.demographicSurveyCompleted = true
      authStore.user.studentData.demographicData =
        response.user?.studentData?.demographicData ?? buildPayload()
    }

    markDemographicSolved()
    clearDraft()
    isEditing.value = false
    await loadSurveyState()

    if (await goToNextPendingQuiz()) return

    // Only the registration run leaves this screen; an update stays here so the
    // person can see the version they just created.
    if (wasFirstSubmission) await $router.push('/user/dashboard')
  } catch (error: unknown) {
    const response = (
      error as {
        response?: { status?: number; data?: { message?: string | string[] } }
      }
    )?.response
    const message = response?.data?.message

    errorMessage.value =
      (Array.isArray(message) ? message[0] : message) ??
      'No pudimos guardar tus respuestas. Vuelve a intentarlo en un momento.'

    // A rejected update means the survey locked in the meantime, so go back to
    // the state that explains why instead of leaving an unsubmittable form.
    if (response?.status === 409) isEditing.value = false

    await loadSurveyState()
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  viewportQuery = window.matchMedia('(max-width: 720px)')
  isNarrow.value = viewportQuery.matches
  viewportQuery.addEventListener('change', syncViewport)

  try {
    if (!userStore.user) userStore.user = authStore.user
    if (!userStore.user?.questionnaireQueue) {
      await userStore.getUserQuestionnaireQueue()
    }

    const demographicQuiz = userStore.user?.questionnaireQueue?.queue.find(
      (item) => item.questionnaireId === 'demographic',
    )

    // Step out of the way only while the registration queue still has something
    // pending; once it is done this screen is reachable on its own.
    if (demographicQuiz?.solved && (await goToNextPendingQuiz())) return

    await loadSurveyState()
    prefillFrom(lastSubmittedData.value)
    loadDraft()
  } catch (error) {
    console.error('Error al preparar el cuestionario sociodemográfico:', error)
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  viewportQuery?.removeEventListener('change', syncViewport)
})
</script>

<template>
  <div class="demographic">
    <p v-if="isLoading" class="demographic__loading">
      Preparando tu cuestionario…
    </p>

    <template v-else>
      <header class="demographic__header">
        <div class="demographic__header-text">
          <span class="demographic__eyebrow">Cuestionarios · registro</span>
          <h1 class="demographic__title">Cuestionario sociodemográfico</h1>
        </div>
        <span v-if="showForm" class="demographic__chip">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Tu avance se guarda en este dispositivo
        </span>
      </header>

      <div class="demographic__body">
        <div class="demographic__main">
          <template v-if="showForm">
            <section class="demographic__progress-card">
              <div class="demographic__progress-text">
                <span class="demographic__progress-title">
                  Llena el siguiente cuestionario para completar tu registro
                </span>
                <span class="demographic__progress-meta">
                  {{ totalCount }} preguntas · alrededor de 2 minutos · puedes
                  salir y volver
                </span>
              </div>
              <div class="demographic__progress-meter">
                <span class="demographic__progress-count">
                  {{ answeredCount }} de {{ totalCount }} respondidas
                </span>
                <span class="demographic__bar">
                  <span
                    class="demographic__bar-fill"
                    :style="{ width: `${progress}%` }"
                  />
                </span>
              </div>
            </section>

            <p v-if="errorMessage" class="demographic__error" role="alert">
              {{ errorMessage }}
            </p>

            <section
              v-for="block in visibleBlocks"
              :key="block.id"
              class="demographic__block"
              :class="{
                'demographic__block--active': block.id === activeBlockId,
              }"
            >
              <button
                type="button"
                class="demographic__block-header"
                :aria-expanded="isBlockOpen(block)"
                @click="toggleBlock(block)"
              >
                <span class="demographic__block-icon">
                  <svg
                    v-if="block.id === 'home'"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#065c5d"
                    stroke-width="2.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                    <circle cx="12" cy="10" r="2.6" />
                  </svg>
                  <svg
                    v-else-if="block.id === 'income'"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#065c5d"
                    stroke-width="2.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M3 7h18v10H3z" />
                    <circle cx="12" cy="12" r="2.4" />
                  </svg>
                  <svg
                    v-else-if="block.id === 'studies'"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#065c5d"
                    stroke-width="2.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v16H5.5A1.5 1.5 0 0 1 4 18.5z"
                    />
                    <path d="M8 8h7" />
                  </svg>
                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#065c5d"
                    stroke-width="2.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M3 12h4l2 5 3-10 2 5h7" />
                  </svg>
                </span>
                <span class="demographic__block-heading">
                  <span class="demographic__block-title">{{
                    block.title
                  }}</span>
                  <span class="demographic__block-meta">
                    {{ block.questions.length }} preguntas ·
                    {{ blockStatus(block) }}
                  </span>
                </span>
                <span
                  v-if="answeredInBlock(block) === block.questions.length"
                  class="demographic__block-flag"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Completo
                </span>
                <span v-else-if="block.note" class="demographic__block-note">
                  {{ block.note }}
                </span>
              </button>

              <div
                v-show="isBlockOpen(block)"
                class="demographic__questions"
                :class="{
                  'demographic__questions--pairs': block.id !== 'income',
                }"
              >
                <label
                  v-for="(question, index) in block.questions"
                  :key="question.key"
                  class="demographic__field"
                  :class="{
                    'demographic__field--wide': isWideField(
                      block,
                      question,
                      index,
                    ),
                  }"
                >
                  <span class="demographic__label">
                    {{ question.label }}
                    <span
                      v-if="block.id === 'income'"
                      class="demographic__pill"
                    >
                      {{ index + 1 }} de {{ block.questions.length }}
                    </span>
                  </span>

                  <input
                    v-if="!question.options"
                    v-model="answers[question.key]"
                    class="demographic__control"
                    type="text"
                    inputmode="numeric"
                    maxlength="5"
                    autocomplete="postal-code"
                    :placeholder="question.placeholder"
                  />
                  <select
                    v-else
                    v-model="answers[question.key]"
                    class="demographic__control demographic__control--select"
                    :class="{
                      'demographic__control--empty': !isAnswered(question),
                    }"
                  >
                    <option value="">{{ question.placeholder }}</option>
                    <option
                      v-for="option in Object.keys(question.options)"
                      :key="option"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </label>
              </div>
            </section>

            <div class="demographic__actions">
              <button
                type="button"
                class="demographic__submit"
                :disabled="!isComplete || isSaving"
                @click="saveAnswers"
              >
                {{ isSaving ? 'Guardando…' : 'Guardar mis respuestas' }}
              </button>
              <span class="demographic__actions-note">
                <template v-if="remainingCount > 0">
                  {{ remainingCount }}
                  {{ remainingCount === 1 ? 'pregunta' : 'preguntas' }} por
                  responder. Tu avance se guarda en este dispositivo.
                </template>
                <template v-else>
                  Todo listo. Al guardar creamos una nueva versión de tus
                  respuestas.
                </template>
              </span>
            </div>
          </template>

          <template v-else>
            <section class="demographic__done">
              <span class="demographic__done-mark">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#04333a"
                  stroke-width="3.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <div class="demographic__done-text">
                <span class="demographic__done-title">Registro completo</span>
                <span class="demographic__done-meta">
                  <template v-if="lastUpdateLabel">
                    Contestaste las {{ totalCount }} preguntas el
                    {{ lastUpdateLabel }}.
                  </template>
                  <template v-else>
                    Ya contestaste las {{ totalCount }} preguntas de este
                    cuestionario.
                  </template>
                </span>
              </div>
            </section>

            <p v-if="errorMessage" class="demographic__error" role="alert">
              {{ errorMessage }}
            </p>

            <section class="demographic__update">
              <p class="demographic__update-text">
                Ten en mente que todos somos humanos, y es natural cambiar.
                Puedes completar este cuestionario la cantidad de veces que
                sientas que tu situación se ha modificado.
              </p>

              <p v-if="isLocked" class="demographic__lock">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                Podrás actualizarlo a partir del {{ nextUpdateLabel }}.
                Guardamos una versión cada {{ availability?.cooldownDays }} días
                para seguir cómo cambia tu contexto.
              </p>

              <button
                type="button"
                class="demographic__update-button"
                :disabled="isLocked"
                @click="startEditing"
              >
                Actualizar mis respuestas
              </button>
            </section>

            <section v-if="summaryRows.length" class="demographic__summary">
              <span class="demographic__summary-title">Lo que respondiste</span>
              <div
                v-for="row in summaryRows"
                :key="row.key"
                class="demographic__summary-row"
              >
                <span class="demographic__summary-label">{{ row.label }}</span>
                <span class="demographic__summary-value">{{ row.value }}</span>
              </div>
            </section>
          </template>
        </div>

        <aside class="demographic__sidebar">
          <article class="demographic__why">
            <span class="demographic__why-title">
              ¿Por qué te preguntamos esto?
            </span>
            <p class="demographic__why-text">
              Recuerda, esta información se recopila únicamente para entender
              mejor los datos demográficos de tu muestra y ayudarte a entender
              mejor tus emociones.
            </p>
            <p class="demographic__why-text">
              Ten en mente que todos somos humanos, y es natural cambiar. Puedes
              completar este cuestionario la cantidad de veces que sientas que
              tu situación se ha modificado.
            </p>
          </article>

          <article class="demographic__versions">
            <span class="demographic__versions-title">
              Tus versiones anteriores
            </span>

            <p v-if="!historyItems.length" class="demographic__versions-empty">
              Todavía no hay versiones guardadas. La primera se crea en cuanto
              guardes tus respuestas.
            </p>

            <div
              v-for="(item, index) in historyItems"
              :key="item.id"
              class="demographic__version"
            >
              <div class="demographic__version-row">
                <span
                  class="demographic__dot"
                  :class="{ 'demographic__dot--latest': index === 0 }"
                />
                <span class="demographic__version-text">
                  <span class="demographic__version-date">{{ item.date }}</span>
                  <span class="demographic__version-summary">
                    {{ item.summary }}
                  </span>
                </span>
                <button
                  type="button"
                  class="demographic__version-toggle"
                  @click="toggleVersion(item.id)"
                >
                  {{ expandedVersionId === item.id ? 'Ocultar' : 'Ver' }}
                </button>
              </div>

              <dl
                v-if="expandedVersionId === item.id"
                class="demographic__version-detail"
              >
                <div
                  v-for="row in item.rows"
                  :key="row.key"
                  class="demographic__version-detail-row"
                >
                  <dt>{{ row.label }}</dt>
                  <dd>{{ row.value }}</dd>
                </div>
              </dl>
            </div>

            <p v-if="historyItems.length" class="demographic__versions-note">
              Guardamos cada versión para ver cómo cambia tu contexto, no para
              comparar personas.
            </p>
          </article>

          <article class="demographic__privacy">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#065c5d"
              stroke-width="2.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 3l8 3v6c0 5-3.5 8.2-8 9-4.5-.8-8-4-8-9V6z" />
            </svg>
            <span>
              Estas respuestas viajan al reporte del instituto sin tu nombre.
              <NuxtLink to="/user/privacy-policy">
                Cómo se usan tus datos </NuxtLink
              >.
            </span>
          </article>
        </aside>
      </div>
    </template>
  </div>
</template>

<style scoped>
.demographic {
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
  background: #f4f8f9;
  min-height: 100vh;
  padding: 24px 36px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demographic__loading {
  margin: 0;
  color: #5c7078;
  line-height: 1.7;
}

.demographic__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.demographic__header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.demographic__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5f767e;
}

.demographic__title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.demographic__chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  background: #dbf2f4;
  color: #065c5d;
  font-size: 13px;
  font-weight: 700;
}

.demographic__chip svg {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
}

.demographic__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  align-items: start;
}

.demographic__main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.demographic__progress-card,
.demographic__block,
.demographic__done,
.demographic__update,
.demographic__summary {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  box-shadow: 0 6px 20px -12px rgba(6, 92, 93, 0.35);
}

.demographic__progress-card {
  padding: 22px 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.demographic__progress-text {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.demographic__progress-title {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.demographic__progress-meta {
  font-size: 14px;
  color: #5f767e;
}

.demographic__progress-meter {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  flex: 0 0 200px;
}

.demographic__progress-count {
  font-size: 13px;
  font-weight: 700;
  color: #065c5d;
}

.demographic__bar {
  width: 200px;
  height: 9px;
  border-radius: 999px;
  background: #e7eff0;
  display: flex;
  overflow: hidden;
}

.demographic__bar-fill {
  background: #07979f;
  transition: width 0.2s ease;
}

.demographic__error {
  margin: 0;
  padding: 16px 20px;
  border-radius: 18px;
  background: #fdecec;
  border: 1px solid #f6cccc;
  color: #8a1c1c;
  font-size: 14px;
  line-height: 1.6;
}

.demographic__block {
  padding: 24px 26px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.demographic__block--active {
  box-shadow: 0 0 0 2px #07979f inset;
}

.demographic__block-header {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  font-family: inherit;
  color: inherit;
  text-align: left;
  cursor: default;
}

.demographic__block-icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 999px;
  background: #dbf2f4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.demographic__block-icon svg {
  width: 18px;
  height: 18px;
}

.demographic__block-heading {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.demographic__block-title {
  font-size: 16px;
  font-weight: 800;
}

.demographic__block-meta {
  font-size: 13px;
  color: #5f767e;
}

.demographic__block-flag {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 13px;
  border-radius: 999px;
  background: #dbf2f4;
  color: #065c5d;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.demographic__block-flag svg {
  width: 13px;
  height: 13px;
  flex: 0 0 13px;
}

.demographic__block-note {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 13px;
  border-radius: 999px;
  background: #fdf4e7;
  color: #8a5a17;
  font-size: 12px;
  font-weight: 800;
  text-align: right;
}

.demographic__questions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px 20px;
}

.demographic__questions--pairs {
  grid-template-columns: 1fr 1fr;
}

.demographic__field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.demographic__field--wide {
  grid-column: 1 / -1;
}

.demographic__label {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
  color: #31474f;
}

.demographic__pill {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  background: #f0eaf5;
  color: #5c4a75;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.demographic__control {
  height: 52px;
  width: 100%;
  border-radius: 999px;
  border: 1.5px solid #dde8ea;
  background: #fff;
  padding: 0 22px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  color: #0e2a36;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.demographic__control::placeholder {
  color: #8a9ba1;
  font-weight: 600;
}

.demographic__control:focus {
  outline: none;
  border-color: #07979f;
  box-shadow: 0 0 0 4px rgba(7, 151, 159, 0.14);
}

.demographic__control--select {
  appearance: none;
  padding-right: 46px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='17' height='17' viewBox='0 0 24 24' fill='none' stroke='%235f767e' stroke-width='2.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 20px center;
  cursor: pointer;
}

.demographic__control--empty {
  color: #8a9ba1;
}

.demographic__actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 6px;
}

.demographic__submit {
  height: 54px;
  padding: 0 34px;
  border-radius: 999px;
  border: 0;
  background: #065c5d;
  color: #fff;
  font-family: inherit;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s ease;
}

.demographic__submit:hover:not(:disabled) {
  background: #04474a;
}

.demographic__submit:disabled {
  background: #b9ced1;
  cursor: not-allowed;
}

.demographic__actions-note {
  font-size: 13.5px;
  color: #5f767e;
}

.demographic__done {
  background: #065c5d;
  border-color: #065c5d;
  padding: 22px 26px;
  display: flex;
  align-items: center;
  gap: 14px;
  color: #fff;
}

.demographic__done-mark {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 999px;
  background: #6cc5cb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.demographic__done-mark svg {
  width: 18px;
  height: 18px;
}

.demographic__done-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.demographic__done-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.demographic__done-meta {
  font-size: 13.5px;
  line-height: 1.55;
  color: #dff1f1;
}

.demographic__update {
  padding: 22px 26px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: flex-start;
}

.demographic__update-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: #31474f;
}

.demographic__lock {
  margin: 0;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: 18px;
  background: #fdf4e7;
  color: #8a5a17;
  font-size: 13.5px;
  line-height: 1.6;
  font-weight: 600;
}

.demographic__lock svg {
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
  margin-top: 2px;
}

.demographic__update-button {
  height: 50px;
  padding: 0 28px;
  border-radius: 999px;
  border: 1.5px solid #065c5d;
  background: #fff;
  color: #065c5d;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.demographic__update-button:hover:not(:disabled) {
  background: #dbf2f4;
}

.demographic__update-button:disabled {
  border-color: #cfdde1;
  color: #8a9ba1;
  cursor: not-allowed;
}

.demographic__summary {
  padding: 22px 26px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demographic__summary-title {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5f767e;
}

.demographic__summary-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #eef4f5;
}

.demographic__summary-row:first-of-type {
  border-top: 0;
  padding-top: 0;
}

.demographic__summary-label {
  font-size: 13px;
  color: #5f767e;
  line-height: 1.45;
}

.demographic__summary-value {
  font-size: 13px;
  font-weight: 700;
  text-align: right;
}

.demographic__sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.demographic__why {
  background: #dbf2f4;
  border-radius: 24px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demographic__why-title {
  font-size: 15px;
  font-weight: 800;
  color: #04474a;
}

.demographic__why-text {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: #04474a;
  text-wrap: pretty;
}

.demographic__versions,
.demographic__privacy {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  box-shadow: 0 6px 20px -12px rgba(6, 92, 93, 0.35);
  padding: 22px;
}

.demographic__versions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demographic__versions-title {
  font-size: 15px;
  font-weight: 800;
}

.demographic__versions-empty,
.demographic__versions-note {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: #5f767e;
}

.demographic__version {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid #eef4f5;
}

.demographic__version:first-of-type {
  border-top: 0;
  padding-top: 0;
}

.demographic__version-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.demographic__dot {
  width: 9px;
  height: 9px;
  flex: 0 0 9px;
  border-radius: 999px;
  background: #cfdde1;
}

.demographic__dot--latest {
  background: #07979f;
}

.demographic__version-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.demographic__version-date {
  font-size: 13.5px;
  font-weight: 700;
}

.demographic__version-summary {
  font-size: 12.5px;
  color: #5f767e;
}

.demographic__version-toggle {
  margin-left: auto;
  border: 0;
  background: none;
  padding: 0;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #07979f;
  cursor: pointer;
}

.demographic__version-toggle:hover {
  color: #065c5d;
}

.demographic__version-detail {
  margin: 0;
  padding: 12px 14px;
  border-radius: 16px;
  background: #f7fafb;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demographic__version-detail-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.demographic__version-detail-row dt {
  font-size: 12.5px;
  color: #5f767e;
  line-height: 1.4;
}

.demographic__version-detail-row dd {
  margin: 0;
  font-size: 12.5px;
  font-weight: 700;
  text-align: right;
}

.demographic__privacy {
  display: flex;
  gap: 11px;
  align-items: flex-start;
  font-size: 13px;
  line-height: 1.6;
  color: #31474f;
}

.demographic__privacy svg {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  margin-top: 2px;
}

.demographic__privacy a {
  color: #07979f;
  font-weight: 700;
  text-decoration: none;
}

.demographic__privacy a:hover {
  color: #065c5d;
}

@media (max-width: 1180px) {
  .demographic__body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .demographic__questions--pairs {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .demographic {
    padding: 20px 18px 40px;
  }

  .demographic__title {
    font-size: 23px;
  }

  .demographic__progress-card,
  .demographic__block,
  .demographic__done,
  .demographic__update,
  .demographic__summary {
    padding: 18px;
    border-radius: 20px;
  }

  .demographic__progress-meter {
    flex: 1 1 100%;
    align-items: stretch;
  }

  .demographic__bar {
    width: 100%;
  }

  /* Only one block is open at a time here, so the header doubles as its
     control. */
  .demographic__block-header {
    cursor: pointer;
  }

  .demographic__block-note {
    display: none;
  }

  .demographic__actions {
    position: sticky;
    bottom: 0;
    margin: 0 -18px -40px;
    padding: 14px 18px 18px;
    background: #fff;
    border-top: 1px solid #e3ecee;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .demographic__submit {
    width: 100%;
  }

  .demographic__actions-note {
    text-align: center;
  }
}
</style>
