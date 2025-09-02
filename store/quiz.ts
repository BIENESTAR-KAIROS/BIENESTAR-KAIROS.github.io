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
  questionnaireId: string
  question: string
  questionId: string
  options: IQuizResponseOption[]
  answer: number | Date | string | Array<string>
  type: QuestionType
}

export interface AnswerDto {
  questionId: string
  textResponse?: string
  numericResponse?: number
  multipleResponse?: string[]
  metadata?: Record<string, any>
  subanswer?: AnswerDto[]
}

export interface SubmitResponseDto {
  questionnaireId: string
  answers: AnswerDto[]
  comments?: string
  submissionMetadata?: Record<string, any>
}

// Clase de error personalizada para el 409
export class AlreadySubmittedError extends Error {
  statusCode: number

  constructor(message: string = 'Usuario ya respondió el cuestionario') {
    super(message)
    this.name = 'AlreadySubmittedError'
    this.statusCode = 409
  }
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
      quizName: '',
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

    async sendAnswers() {
      console.log('🎯 STORE - sendAnswers iniciando...')
      const nuxtApp = useNuxtApp()

      const cleanAnswer = (ans: IQuizResponse): AnswerDto => {
        return {
          questionId: ans.questionId,
          textResponse: typeof ans.answer === 'string' ? ans.answer : undefined,
          numericResponse:
            typeof ans.answer === 'number' ? ans.answer : undefined,
          multipleResponse: Array.isArray(ans.answer) ? ans.answer : undefined,
          subanswer: ans.options
            .map((opt) =>
              opt.subquestions
                ? opt.subquestions.map((subq) => cleanAnswer(subq))
                : [],
            )
            .flat(),
        }
      }

      const answers: SubmitResponseDto = {
        questionnaireId: this.quiz[0].questionnaireId,
        answers: this.quiz.map((answer) => cleanAnswer(answer)),
      }

      console.log('🎯 STORE - Datos a enviar:', {
        questionnaireId: answers.questionnaireId,
        answersCount: answers.answers.length,
      })

      console.log('🎯 STORE - Haciendo request POST...')

      try {
        const response = await nuxtApp.$axios.post(
          `/questionnaires/${this.quiz[0].questionnaireId}/responses`,
          answers,
          // SIN validateStatus por ahora
        )

        console.log(
          '🎯 STORE - Response recibida exitosamente:',
          response.status,
        )
        return response.data
      } catch (error: any) {
        console.log('🎯 STORE - Error capturado en sendAnswers')
        console.error('🎯 STORE - Error completo:', error)
        console.log('🎯 STORE - Error.message:', error?.message)
        console.log(
          '🎯 STORE - Error.response?.status:',
          error?.response?.status,
        )

        // Simplemente re-lanzar el error tal como está
        throw error
      }
    },
  },
})
