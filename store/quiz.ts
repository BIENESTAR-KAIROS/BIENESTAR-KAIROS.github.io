import { defineStore } from "pinia"

export const useQuizStore = defineStore( "quiz", {
  state: () => {
    return {
      isFinished: false,
      isDynamic: false,
      quiz: [],
      totalQUestions: 0,
      actualQuestion: 0
    };
  },
});
