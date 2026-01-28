import { defineStore } from 'pinia'
import type { QuestionnaireAnswerResponseDto } from '~/dto/response/questionnaire/questionnaire-answer.response.dto'
import type {
  INewQuizResponse,
  INewQuiz,
  INewQuestionDto,
  ICreateEvaluationConfigurationDto,
} from '~/interfaces/quizzes/new-quiz.interface'
import type {
  CreateQuestionnaireAnswerDto,
  SendQuestionAnswerDto,
} from '~/interfaces/quizzes/questionnaire-answere.interface'
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
      studentId: '',
      quiz: [] as IQuizResponse[],
      answers: [] as SendQuestionAnswerDto[],
      canAccessQuestionHistory: true,
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
      const nuxtApp = useNuxtApp()

      const payload: CreateQuestionnaireAnswerDto = {
        studentId: this.studentId,
        questionnaireId: this.quiz[0].questionnaireId,
        submittedAt: new Date(),
        responses: this.answers,
      }

      try {
        const response =
          await nuxtApp.$axios.post<QuestionnaireAnswerResponseDto>(
            `/questionnaire/${this.quiz[0].questionnaireId}/responses`,
            payload,
          )

        return response.data
      } catch (error: any) {
        throw error
      }
    },
  },
})
