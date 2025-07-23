import { defineStore } from 'pinia'
import type {
  INewQuizResponse,
  INewQuiz,
  INewQuestionDto,
  ICreateEvaluationConfigurationDto,
} from '~/interfaces/quizzes/new-quiz.interface'
import type { IQuestionOption } from '~/interfaces/quizzes/quiz.interface'

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TEXT = 'text',
  DATE = 'date',
  RATE = 'rate',
}

export interface IQuizResponseOption {
  option: IQuestionOption
  subquestions?: IQuizResponse[]
}

export interface IQuizResponse {
  question: string
  options: IQuizResponseOption[]
  answer: number | Date | string | Array<string>
  type: QuestionType
}

export const useQuizStore = defineStore('quiz', {
  state: () => {
    return {
      isLastQuestion: false,
      isFinished: false,
      isDynamic: false,
      quiz: [] as IQuizResponse[],
      totalQuestions: 0,
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
