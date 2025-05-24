<script setup lang="ts">
import quiz from "~/utils/constants/dummy-quiz"
import QuizNavigation from "./quiz-navigation.vue";
import { useQuizStore } from "~/store/quiz";
import { useDisplay } from "vuetify"
import { wrapInArray } from "vuetify/lib/util/helpers.mjs";

const { mobile } = useDisplay();

const quizStore = useQuizStore();
const questions = ref([])
const totalQuestions = quiz.length / 5
const isLoading = ref(true)
const inline = ref(null)
const responses = ref(["Completamente en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Completamente de acuerdo"])

onMounted(() => {  
  let questionNumber =  Math.floor(Math.random() * 5)
  if(quizStore.quiz.length === 0){
    for(let i=0; i < quiz.length; i+=5){
      questions.value.push(quiz[ i + questionNumber ].question)
      quizStore.quiz.push({
        question: quiz[ i + questionNumber ].question,
        answer: 0
      })
      questionNumber =  Math.floor(Math.random() * 5)
    }
    quizStore.totalQUestions = totalQuestions
  }
  isLoading.value = false
})

const actualQuestion = computed(() => {
  return quizStore.actualQuestion
})
</script>

<template>
  <div
    :class="((mobile) ? 'h-100' : 'h-85') + ' d-flex flex-column justify-space-around align-center'"
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
      class="w-85 h-85 pa-4"
      rounded="xl"
      :elevation="8"
    >
      <div 
        v-if="isLoading"
        class="d-flex flex-column justify-center align-center h-100 w-100"
      >
        <div
          class="w-85 text-center text-h5 handlee-regular font-weight-thin"
        >
          <span>
            Cargando tu examen
          </span>
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
        <div
          class="w-85 text-center text-h6 yantramanav-regular"
        >
          <span>
            {{quizStore.quiz[quizStore.actualQuestion]["question"]}}
          </span>
        </div>
        <div class="w-75">
          <v-row no-gutters class="w-100">
            <v-col cols="2">
          <span> En desacuerdo </span>
            </v-col>
            <v-col class="d-flex justify-center">
    <v-slider
        v-model="quizStore.quiz[quizStore.actualQuestion]['answer']"
        :max="5"
        :min="1"
        :step="1"
        thumb-label
      ></v-slider>
            </v-col>
            <v-col cols="2" class="d-flex justify-end">
          <span>De acuerdo</span>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-sheet>
  </div>

  <QuizNavigation />

</template>
