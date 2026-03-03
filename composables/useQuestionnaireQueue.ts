import { useAuthStore } from '~/store/auth'
import type { IQuizzesAvaibleResponse } from '~/interfaces/quizzes/quiz-preview.interface'

interface InstituteQueueItem {
  order: number
  questionnaireId: string
}

interface InstituteSettingResponse {
  queue: InstituteQueueItem[]
}

interface NextQuestionnaireResult {
  nextQuestionnaireId: string | null
  queue: InstituteQueueItem[]
}

const sortByOrder = (queue: InstituteQueueItem[]) => {
  return [...queue].sort((a, b) => a.order - b.order)
}

export const useQuestionnaireQueue = () => {
  const { $axios } = useNuxtApp()
  const authStore = useAuthStore()

  const resolveNextQuestionnaire =
    async (): Promise<NextQuestionnaireResult> => {
      const user = authStore.user
      const instituteId = user?.institute?._id

      if (!instituteId) {
        return { nextQuestionnaireId: null, queue: [] }
      }

      const { data: setting } = await $axios.get<InstituteSettingResponse>(
        `/institute-setting/institute/${instituteId}`,
      )

      const queue = sortByOrder(setting.queue || [])

      if (!queue.length) {
        return { nextQuestionnaireId: null, queue }
      }

      const { data: available } = await $axios.get<IQuizzesAvaibleResponse>(
        `/questionnaire/available/${user._id}`,
      )

      const availableIds = new Set(
        (available.questionnaires || []).map(
          (questionnaire) => questionnaire._id,
        ),
      )
      const demographicCompleted =
        user.studentData?.demographicSurveyCompleted === true

      const pending = queue.find((item) => {
        if (item.questionnaireId === 'demographic') {
          return !demographicCompleted
        }

        return availableIds.has(item.questionnaireId)
      })

      return {
        nextQuestionnaireId: pending?.questionnaireId || null,
        queue,
      }
    }

  const getQuestionnaireRoute = (questionnaireId: string) => {
    if (questionnaireId === 'demographic') {
      return '/user/quiz/demographic'
    }

    return `/user/quiz/${questionnaireId}`
  }

  return {
    resolveNextQuestionnaire,
    getQuestionnaireRoute,
  }
}
