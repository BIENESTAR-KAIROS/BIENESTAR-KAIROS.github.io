<script setup lang="ts">
import type {
  INewQuestionDto,
  INewQuizResponse,
} from '~/interfaces/quizzes/new-quiz.interface'
import { useQuizStore } from '~/store/quiz'

const quizStore = useQuizStore()
const newQuiz = ref({} as INewQuestionDto)

const countQuestions = computed(() => {
  return quizStore.newQuiz?.questions?.length || 0
})
const isActivePreview = computed(() => {
  return true
})

const response = ref({} as INewQuizResponse)
async function saveQuiz() {
  try {
    response.value = quizStore.saveQuiz()
  } catch (error) {
    console.log('Error on save questionarie')
    console.error(error)
  }
}
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="10">
        <v-row>
          <v-col cols="12">
            <div class="my-4">
              <h1 class="handlee-regular text-h4 font-weight-thin">
                Crear un nuevo cuestionario
              </h1>
            </div>
          </v-col>
          <v-col cols="12">
            <div class="my-4">
              <h2 class="handlee-regular text-h6 font-weight-thin">
                Aquí podrás crear cuestionarios personalizados para tus
                usuarios, puedes seleccionar un grupo de usuarios o un usuario
                particular.
              </h2>
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" md="2">
        <div
          class="w-100 h-100 d-flex flex-column justify-space-around align-center"
        >
          <div class="h-100 w-100 d-flex justify-center">
            <v-btn color="thirdy" @click="saveQuiz"> Guadar </v-btn>
          </div>
          <div class="h-100 w-100 d-flex justify-center">
            <v-btn color="thirdy" :readonly="isActivePreview"> Preview </v-btn>
          </div>
          <div class="h-100 w-100 d-flex justify-center">
            <v-card
              :elevation="5"
              color="purpleShadow"
              rounded="xxl"
              class="h-100 w-85 d-flex flex-column justify-center align-center"
            >
              <v-card-title class="handlee-regular text-h6 font-weight-thin">
                Total de preguntas
              </v-card-title>
              {{ countQuestions }}
            </v-card>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
