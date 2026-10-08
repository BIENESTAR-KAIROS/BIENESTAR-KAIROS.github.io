import { isAxiosError } from 'axios'
import type { QuestionnaireActiveResponse } from '~/interfaces/quizzes/quiz-builder.interface'
import { useAuthStore } from '~/store/auth'
import type {
  IInstituteQuizCard,
  IInstituteQuizListItem,
  IInstituteQuizListResponse,
  IQuizStatisticsResponse,
} from '~/interfaces/quizzes/institute-quiz.interface'

/** Los estados que la pantalla puede tomar además del normal. */
export type QuizzesState = 'loading' | 'error' | 'empty' | 'ready'

/**
 * Sin grupos asignados el backend deja responder a cualquier alumno de la
 * institución (`validateRespondentAccess`), así que la ausencia de grupos no es
 * "sin audiencia": es la institución entera.
 */
function audienceLabelFor(quiz: IInstituteQuizListItem): string {
  if (quiz.status === 'draft') return 'Sin publicar'
  if (quiz.audience === 'global')
    return 'Todos los estudiantes · asignación global'
  const groups = quiz.assignedGroups ?? []
  if (groups.length === 0) return 'Toda la institución'
  if (groups.length === 1) return groups[0].name
  if (groups.length === 2) return `${groups[0].name} y ${groups[1].name}`
  return `${groups[0].name} y ${groups.length - 1} grupos más`
}

function updatedLabelFor(
  quiz: Pick<IInstituteQuizListItem, 'modificationDate' | 'creationDate'>,
): string | null {
  const raw = quiz.modificationDate ?? quiz.creationDate
  if (!raw) return null

  const value = new Date(raw)
  if (Number.isNaN(value.getTime())) return null

  const sameYear = value.getFullYear() === new Date().getFullYear()
  const date = value.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: sameYear ? undefined : 'numeric',
  })

  return `${quiz.modificationDate ? 'Actualizado' : 'Creado'} el ${date}`
}

export function useMyQuizzes() {
  const { $axios } = useNuxtApp()
  const authStore = useAuthStore()

  const state = ref<QuizzesState>('loading')
  const errorMessage = ref('')
  const quizzes = ref<IInstituteQuizCard[]>([])
  const savingIds = ref<string[]>([])
  const actionErrors = ref<Record<string, string>>({})
  const actionMessage = ref('')

  async function setActive(quiz: IInstituteQuizCard, active: boolean) {
    if (
      quiz.readonly ||
      quiz.status === 'draft' ||
      savingIds.value.includes(quiz.id)
    )
      return
    savingIds.value.push(quiz.id)
    actionErrors.value[quiz.id] = ''
    actionMessage.value = ''
    try {
      const { data } = await $axios.patch<QuestionnaireActiveResponse>(
        `/questionnaire/${quiz.id}/active`,
        {
          active,
          revision: quiz.revision ?? 0,
        },
      )
      quizzes.value = quizzes.value.map((card) =>
        card.id === quiz.id
          ? {
              ...card,
              active: data.active,
              revision: data.revision,
              updatedLabel: data.modificationDate
                ? updatedLabelFor({ modificationDate: data.modificationDate })
                : card.updatedLabel,
            }
          : card,
      )
      actionMessage.value = `«${quiz.title}» está ${data.active ? 'activo' : 'inactivo'}.`
    } catch (error) {
      const detail = isAxiosError<{ message?: string | string[] }>(error)
        ? error.response?.data?.message
        : undefined
      actionErrors.value[quiz.id] =
        (Array.isArray(detail) ? detail.join(' ') : detail) ||
        'No pudimos cambiar el estado. Vuelve a intentarlo.'
    } finally {
      savingIds.value = savingIds.value.filter((id) => id !== quiz.id)
    }
  }

  const instituteId = computed(() => {
    const institute = authStore.user?.institute
    if (!institute) return undefined
    return typeof institute === 'string' ? institute : institute._id
  })

  const activeCount = computed(
    () => quizzes.value.filter((quiz) => quiz.active).length,
  )

  const toCard = (quiz: IInstituteQuizListItem): IInstituteQuizCard => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description?.trim() || 'Sin descripción.',
    active: quiz.active,
    revision: quiz.revision,
    status: quiz.status,
    schemaVersion: quiz.schemaVersion,
    readonly: Boolean(
      quiz.ownerType === 'platform' ||
      !quiz.institution?.id ||
      quiz.institution.id !== instituteId.value,
    ),
    questionsCount: quiz.questionsCount ?? 0,
    groups: quiz.assignedGroups ?? [],
    audienceLabel: audienceLabelFor(quiz),
    responses: null,
    updatedLabel: updatedLabelFor(quiz),
  })

  /**
   * El conteo de respuestas vive en otro endpoint, que todavía no está migrado
   * a la arquitectura nueva de escanor: hoy responde 404 y la tarjeta se queda
   * sin el dato en vez de tumbar la pantalla. Cuando exista, esto ya funciona.
   */
  async function loadResponses(cards: IInstituteQuizCard[]) {
    const results = await Promise.allSettled(
      cards.map((card) =>
        card.status === 'draft'
          ? Promise.resolve(null)
          : $axios.get<IQuizStatisticsResponse>(
              `/questionnaires/${card.id}/statistics`,
            ),
      ),
    )

    quizzes.value = quizzes.value.map((card) => {
      const index = cards.findIndex((item) => item.id === card.id)
      if (index < 0) return card
      const result = results[index]
      if (result.status !== 'fulfilled' || !result.value) return card

      const { total, potential, responseRate } = result.value.data.responses
      return { ...card, responses: { total, potential, responseRate } }
    })
  }

  async function load() {
    state.value = 'loading'
    errorMessage.value = ''

    if (!instituteId.value) {
      state.value = 'error'
      errorMessage.value =
        'Tu sesión no tiene una institución asociada, así que no podemos buscar sus cuestionarios.'
      return
    }

    try {
      const { data } = await $axios.get<IInstituteQuizListResponse>(
        '/questionnaire',
        { params: { institutionId: instituteId.value } },
      )

      const cards = (data.questionnaires ?? []).map(toCard)
      quizzes.value = cards
      state.value = cards.length ? 'ready' : 'empty'

      if (cards.length) await loadResponses(cards)
    } catch (error) {
      console.error('Error cargando los cuestionarios del instituto', error)
      state.value = 'error'
      errorMessage.value =
        'No pudimos cargar tus cuestionarios. Vuelve a intentarlo en un momento.'
    }
  }

  return {
    state,
    savingIds,
    actionErrors,
    actionMessage,
    setActive,
    errorMessage,
    quizzes,
    activeCount,
    load,
  }
}
