<script setup lang="ts">
import QuizNavigation from './quiz-navigation.vue'
import { useQuizStore, QuestionType, type IQuizResponse } from '~/store/quiz'
import { useDisplay } from 'vuetify'
import type { IQuestion, IQuiz } from '~/interfaces/quizzes/quiz.interface'
import Question from './question.vue'

const { mobile } = useDisplay()
const route = useRoute()
const { $axios } = useNuxtApp()

const quizStore = useQuizStore()
const questions = ref([] as string[])
const totalQuestions = ref(0)
const isLoading = ref(true)
const inline = ref(null)
const responses = ref([
  'Completamente en desacuerdo',
  'En desacuerdo',
  'Neutral',
  'De acuerdo',
  'Completamente de acuerdo',
])

onMounted(async () => {
  const questionResponse = (question: IQuestion): IQuizResponse => {
    return {
      question: question.text,
      options: question.options.map((option) => ({
        option,
        subquestions: option.subquestions
          ? option.subquestions.map((sub) => questionResponse(sub))
          : [],
      })),
      answer: 0,
      type: QuestionType[
        question.type.toUpperCase() as keyof typeof QuestionType
      ],
    }
  }

  try {
    isLoading.value = true
    const { data: quiz } = await $axios.get<IQuiz>(
      `/questionnaires/${route.params.id}`,
    )
    quizStore.quiz = []
    quizStore.isLastQuestion = false
    quizStore.isFinished = false
    quizStore.totalQuestions = 0
    quizStore.actualQuestion = 0
    for (let i = 0; i < quiz.questionnaire.questions.length; i++) {
      questions.value.push(quiz.questionnaire.questions[i].text)
      quizStore.quiz.push(questionResponse(quiz.questionnaire.questions[i]))
    }
    quizStore.totalQuestions = quiz.questionnaire.questions.length
    totalQuestions.value = quiz.questionnaire.questions.length
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
})

const actualQuestion = computed(() => {
  return quizStore.actualQuestion
})
</script>

<template>
  <div
    :class="
      (mobile ? 'h-100' : 'h-85') +
      ' d-flex flex-column justify-space-around align-center'
    "
  >
    <div class="w-85">
      <v-progress-linear
        :location="null"
        bg-color="black"
        color="secondary"
        height="12"
        :max="totalQuestions - 1"
        :min="1"
        :model-value="actualQuestion"
        rounded
      ></v-progress-linear>
    </div>
    <v-sheet
      class="w-85 h-85 px-4 py-8 overflow-auto"
      rounded="xl"
      :elevation="8"
    >
      <div
        v-if="isLoading"
        class="d-flex flex-column justify-center align-center h-100 w-100"
      >
        <div class="w-85 text-center text-h5 handlee-regular font-weight-thin">
          <span> Cargando tu examen </span>
        </div>
        <v-progress-circular
          color="secondary"
          indeterminate
          class="mt-5"
        ></v-progress-circular>
      </div>
      <div
        v-else
        class="d-flex flex-column justify-space-evenly align-center h-100 w-100"
      >
        <v-sheet
          class="w-100 h-100 overflow-auto d-flex flex-column justify-space-evenly align-center"
        >
          <Question :question="quizStore.quiz[quizStore.actualQuestion]" />
        </v-sheet>
      </div>
    </v-sheet>
  </div>

  <QuizNavigation />
</template>
