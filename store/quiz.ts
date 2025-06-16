import { defineStore } from 'pinia'

export const useQuizStore = defineStore('quiz', {
  state: () => {
    return {
      isLastQuestion: false,
      isFinished: false,
      isDynamic: false,
      quiz: [{ question: '', answer: 0 }],
      totalQUestions: 0,
      actualQuestion: 0,
    }
  },
})
