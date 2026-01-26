<script setup lang="ts">
import QuizNavigation from './quiz-navigation.vue'
import { useQuizStore, QuestionType, type IQuizResponse } from '~/store/quiz'
import { useDisplay } from 'vuetify'
import type { IQuestion, IQuiz } from '~/interfaces/quizzes/quiz.interface'
import Question from './question.vue'
import { useAuthStore } from '~/store/auth'

const route = useRoute()
const { $axios } = useNuxtApp()

const authStore = useAuthStore()

const quizStore = useQuizStore()
const questions = ref([] as string[])
const totalQuestions = ref(0)
const isLoading = ref(true)

onMounted(async () => {
  if (authStore.user) {
    quizStore.studentId = authStore.user.id
  }

  const questionResponse = (question: IQuestion): IQuizResponse => {
    console.log(question)

    return {
      questionId: question.id,
      questionnaireId: route.params.id as string,
      question: question.text,
      options: question.options.map((option) => ({
        option,
        subquestions: option.subquestions
          ? option.subquestions.map((sub) => questionResponse(sub))
          : [],
      })),
      answer: -1,
      type: QuestionType[
        question.type.toUpperCase() as keyof typeof QuestionType
      ],
    }
  }

  try {
    isLoading.value = true
    const { data: quiz } = await $axios.get<IQuiz>(
      `/questionnaire/${route.params.id}`,
    )
    quizStore.quiz = []
    quizStore.isLastQuestion = false
    quizStore.isFinished = false
    quizStore.totalQuestions = 0
    quizStore.actualQuestion = 0
    quizStore.quizName = quiz.title
    for (let i = 0; i < quiz.questions.length; i++) {
      questions.value.push(quiz.questions[i].text)
      quizStore.quiz.push(questionResponse(quiz.questions[i]))
    }
    quizStore.totalQuestions = quiz.questions.length
    totalQuestions.value = quiz.questions.length
    console.log(questions)
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
  <v-container class="py-0">
    <v-row no-gutters>
      <v-col no-gutters>
        <v-sheet class="w-100 px-4 py-5 m-0" :elevation="8">
          <div
            v-if="isLoading"
            class="d-flex flex-column justify-center align-center h-100 w-100"
          >
            <div
              class="w-85 text-center text-h5 handlee-regular font-weight-thin"
            >
              <span> Cargando tu prueba </span>
            </div>
            <v-progress-circular
              color="secondary"
              indeterminate
              class="mt-5"
            ></v-progress-circular>
          </div>
          <div
            v-else
            class="d-flex flex-column justify-space-evenly align-center w-100"
          >
            <v-card
              class="w-100 d-flex flex-column justify-space-evenly align-center"
              :elevation="0"
            >
              <v-card-title class="text-h5 handlee-regular font-weight-thin">
                {{ quizStore.quizName }}
              </v-card-title>
              <Question :question="quizStore.quiz[quizStore.actualQuestion]" />
            </v-card>
          </div>
          <div class="w-100 mt-2 mb-6">
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
          <QuizNavigation />
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
