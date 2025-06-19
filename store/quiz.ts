import { defineStore } from 'pinia'
import type {
  INewQuizResponse,
  INewQuiz,
  INewQuestionDto,
  ICreateEvaluationConfigurationDto,
} from '~/interfaces/quizzes/new-quiz.interface'

export const useQuizStore = defineStore('quiz', {
  state: () => {
    return {
      isLastQuestion: false,
      isFinished: false,
      isDynamic: false,
      quiz: [{ question: '', answer: 0 }],
      totalQUestions: 0,
      actualQuestion: 0,
      newQuiz: {
        title: '',
        description: '',
        creatorId: '',
        institutionId: '',
        active: true,
        questions: [] as INewQuestionDto[],
        groupAssignments: [] as string[],
        evaluationConfiguration: {} as ICreateEvaluationConfigurationDto,
      } as INewQuiz,
    }
  },
  actions: {
    async saveQuiz() {
      const nuxtApp = useNuxtApp()
      try {
        const { data } = await nuxtApp.$axios.post<INewQuizResponse>(
          `/questionnaires`,
          this.newQuiz,
        )
        return data
      } catch (error) {
        console.error(error)
      }
    },
  },
})
