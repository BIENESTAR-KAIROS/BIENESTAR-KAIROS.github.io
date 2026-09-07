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
  const groups = quiz.assignedGroups ?? []
  if (groups.length === 0) return 'Toda la institución'
  if (groups.length === 1) return groups[0].name
  if (groups.length === 2) return `${groups[0].name} y ${groups[1].name}`
  return `${groups[0].name} y ${groups.length - 1} grupos más`
}

function updatedLabelFor(quiz: IInstituteQuizListItem): string | null {
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
    readonly: Boolean(
      quiz.institution?.id && quiz.institution.id !== instituteId.value,
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
        $axios.get<IQuizStatisticsResponse>(
          `/questionnaires/${card.id}/statistics`,
        ),
      ),
    )

    quizzes.value = cards.map((card, index) => {
      const result = results[index]
      if (result.status !== 'fulfilled') return card

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
    errorMessage,
    quizzes,
    activeCount,
    load,
  }
}
