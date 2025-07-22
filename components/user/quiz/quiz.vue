<script setup lang="ts">
import QuizNavigation from './quiz-navigation.vue'
import { useQuizStore, QuestionType } from '~/store/quiz'
import { useDisplay } from 'vuetify'
import type { IQuiz } from '~/interfaces/quizzes/quiz.interface'

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
  try {
    isLoading.value = true
    const { data: quiz } = await $axios.get<IQuiz>(
      `/questionnaires/${route.params.id}`,
    )
    console.log(quiz)

    quizStore.quiz = []
    for (let i = 0; i < quiz.questionnaire.questions.length; i++) {
      questions.value.push(quiz.questionnaire.questions[i].text)
      quizStore.quiz.push({
        question: quiz.questionnaire.questions[i].text,
        type: QuestionType[
          quiz.questionnaire.questions[
            i
          ].type.toUpperCase() as keyof typeof QuestionType
        ],
        answer: 0,
      })
    }
    quizStore.totalQuestions = quiz.questionnaire.questions.length
    totalQuestions.value = quiz.questionnaire.questions.length
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
  console.log(quizStore.quiz)
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
    <v-sheet class="w-85 h-85 pa-4" rounded="xl" :elevation="8">
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
        <div class="w-85 text-center text-h6 yantramanav-regular">
          <span>
            {{ quizStore.quiz[quizStore.actualQuestion]['question'] }}
          </span>
        </div>
        <div class="w-75">
          <v-row no-gutters class="w-100">
            <v-col cols="6" md="2">
              <span class="catamaran-text text-body-1 font-weight-regular">
                En desacuerdo
              </span>
            </v-col>
            <v-col
              class="d-flex justify-center"
              cols="12"
              md=""
              order="last"
              order-md="2"
            >
              <v-slider
                v-model="
                  quizStore.quiz[quizStore.actualQuestion]['answer'] as number
                "
                :max="5"
                :min="1"
                :step="1"
                :thumb-label="true"
                color="secondary"
              ></v-slider>
            </v-col>
            <v-col cols="6" md="2" class="d-flex justify-end" order-md="last">
              <span class="catamaran-text text-body-1 font-weight-regular"
                >De acuerdo</span
              >
            </v-col>
          </v-row>
        </div>
      </div>
    </v-sheet>
  </div>

  <QuizNavigation />
</template>
