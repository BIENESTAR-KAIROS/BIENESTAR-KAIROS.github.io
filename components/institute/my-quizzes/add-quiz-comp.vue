<script setup lang="ts">
import type {
  INewQuestionDto,
  INewQuiz,
  INewQuizResponse,
} from '~/interfaces/quizzes/new-quiz.interface'
import { useQuizStore } from '~/store/quiz'
import { required } from '~/utils/helpers/form-rules'

const quizStore = useQuizStore()
const newQuiz = ref({} as INewQuiz)
const newQuestion = ref({} as INewQuestionDto)
const range = ref(0)

const countQuestions = computed(() => {
  return quizStore.newQuiz?.questions?.length || 0
})
const isActivePreview = computed(() => {
  return true
})

const response = ref({} as INewQuizResponse | undefined)
async function saveQuiz() {
  try {
    response.value = await quizStore.saveQuiz()
  } catch (error) {
    console.log('Error on save questionarie')
    console.error(error)
  }
}
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="9">
        <v-row>
          <v-col cols="12">
            <div class="my-4">
              <h1 class="handlee-regular text-h4 font-weight-thin">
                Crear un nuevo cuestionario
              </h1>
            </div>
          </v-col>
          <v-col cols="12">
            <div class="mt-4 mb-2">
              <h2 class="handlee-regular text-h6 font-weight-thin">
                Aquí podrás crear cuestionarios personalizados para tus
                usuarios, puedes seleccionar un grupo de usuarios o un usuario
                particular.
              </h2>
            </div>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12">
            <v-text-field
              label="Nombre de tu cuestionario"
              bg-color="purpleShadow"
              variant="solo-filled"
              clearable
              rounded="xxl"
              v-model="newQuiz.title"
              :roles="[required]"
              validate-on="lazy input"
              class="w-75"
            />
          </v-col>
          <v-col cols="12">
            <div class="my-2">
              <h2 class="catamaran-regular text-h5 font-weight-light">
                Crear pregunta nueva
              </h2>
            </div>
          </v-col>

          <v-col cols="12">
            <v-text-field
              label="Escribe aqui tu pregunta"
              bg-color="purpleShadow"
              variant="solo-filled"
              clearable
              rounded="xxl"
              v-model="newQuestion.text"
              :roles="[required]"
              validate-on="lazy input"
            />
          </v-col>
          <v-col cols="2" />
          <v-col cols="10">
            <v-text-field
              label="Rango de tu respuesta"
              bg-color="purpleShadow"
              variant="solo-filled"
              clearable
              rounded="xxl"
              v-model="range"
              :roles="[required]"
              validate-on="lazy input"
            />
          </v-col>
          <v-col>
            <div class="text-justify">
              <span class="yantramanav-regular text-body-1 font-weight-regular">
                Recuerda que para que tengan mejor eficiencia, las preguntas
                deben estar hechas en positivo
              </span>
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" md="3">
        <div
          class="w-100 h-100 d-flex flex-column justify-space-around align-center"
        >
          <div class="h-100 w-75 d-flex flex-column justify-center mb-4">
            <v-btn color="thirdy" @click="saveQuiz" class="mb-4">
              Guadar
            </v-btn>
            <v-btn color="thirdy" :readonly="isActivePreview"> Preview </v-btn>
          </div>

          <div
            class="h-100 w-100 d-flex flex-column justify-center align-center mb-4"
          >
            <v-card
              :elevation="5"
              color="purpleShadow"
              rounded="xxl"
              class="pa-2 h-100 w-85 d-flex flex-column justify-center align-center mb-2"
            >
              <v-card-title class="handlee-regular text-h6 font-weight-thin">
                Total de preguntas
              </v-card-title>
              {{ countQuestions }}
            </v-card>
            <div class="w-75 text-justify">
              <span class="yantramanav-regular text-body-2 font-weight-regular">
                Recuerda que la recomendación es que no pasen de 50 y sean más
                de 25
              </span>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <h2 class="catamaran-regular text-h5 font-weight-regular">
          Preguntas actuales de mi cuestionario
        </h2>
      </v-col>
    </v-row>
  </v-container>
</template>
