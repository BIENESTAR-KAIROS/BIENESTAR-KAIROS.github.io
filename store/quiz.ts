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
  /** Legacy name for a single-answer question with options. */
  MULTIPLE_CHOICE = 'multiple_choice',
  SINGLE_CHOICE = 'single_choice',
  /** Several answers at once. */
  CHECKBOX = 'checkbox',
  /** Single answer picked from a long catalogue. */
  DROPDOWN = 'dropdown',
  TEXT = 'text',
  DATE = 'date',
  NUMBER = 'number',
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
  answer: number | Date | string | Array<string> | Array<number>
  type: QuestionType
  evaluateByCategory?: boolean
  category?: string | null
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

/** A question is answered when it holds something other than the `-1` seed. */
export function isAnswered(question: IQuizResponse): boolean {
  const { answer } = question
  if (Array.isArray(answer)) return answer.length > 0
  if (answer instanceof Date) return true
  if (typeof answer === 'string') return answer.trim().length > 0
  return typeof answer === 'number' && answer > -1
}

/** Option weights the student picked — one for single answers, many for checkboxes. */
export function selectedWeights(question: IQuizResponse): number[] {
  const { answer } = question
  if (Array.isArray(answer)) return answer.map(Number)
  if (typeof answer === 'number' && answer > -1) return [answer]
  return []
}

/** Subquestions hanging off the options the student actually picked. */
export function activeSubquestions(question: IQuizResponse): IQuizResponse[] {
  const picked = selectedWeights(question)
  if (picked.length === 0) return []

  return question.options
    .filter((option) => picked.includes(option.option.weight))
    .flatMap((option) => option.subquestions ?? [])
}

/** The question plus every subquestion the current answers opened, depth first. */
export function expandQuestion(question: IQuizResponse): IQuizResponse[] {
  return [question, ...activeSubquestions(question).flatMap(expandQuestion)]
}

export function expandQuiz(questions: IQuizResponse[]): IQuizResponse[] {
  return questions.flatMap(expandQuestion)
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
      evaluateByCategory: false,
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
