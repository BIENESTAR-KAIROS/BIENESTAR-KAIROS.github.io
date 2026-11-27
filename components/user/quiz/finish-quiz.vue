<script setup lang="ts">
import RecommendationSource from '../recomendations/recommendation-source.vue'
import { useQuizStore, type IQuizResponse } from '~/store/quiz'

const quizStore = useQuizStore()
const { $router } = useNuxtApp()
const route = useRoute()
const submission = computed(() =>
  quizStore.lastSubmission?.questionnaireId ===
  quizStore.quiz[0]?.questionnaireId
    ? quizStore.lastSubmission
    : null,
)
const calification = computed(() => {
  let sum = 0
  const suma = (question: IQuizResponse): number => {
    let temp = 0
    temp += Number(question.answer) < 0 ? 0 : Number(question.answer)
    question.options.forEach((option) => {
      option.subquestions?.forEach((sub) => {
        temp += Number(suma(sub))
      })
    })
    return temp
  }

  quizStore.quiz.forEach((question) => {
    sum += suma(question)
  })

  return sum
})

const categories = computed(() => {
  const cats: Record<string, number> = {}
  quizStore.quiz.forEach((question) => {
    const category = question.category || 'Sin categoría'
    if (!cats[category]) {
      cats[category] = 0
    }
    cats[category] += evaluteQuestion(question)
  })
  return cats
})

const evaluteQuestion = (question: IQuizResponse) => {
  let temp = 0
  temp += Number(question.answer) < 0 ? 0 : Number(question.answer)
  question.options.forEach((option) => {
    option.subquestions?.forEach((sub) => {
      temp += evaluteQuestion(sub)
    })
  })
  return temp
}

const alreadySubmitted = computed(() => route.query.alreadySubmitted === 'true')
const goToNextOrDashboard = () => $router.push('/user/quiz')
</script>

<template>
  <div>
    <v-row class="h-md-screen">
      <v-col cols="12" md="3" class="h-100">
        <div class="d-block d-md-none">
          <v-img src="/image-result-quiz.png" height="200" />
        </div>
        <div class="d-none d-md-flex h-100 flex-column pa-4">
          <v-img src="/image-result-quiz.png" height="300" />
        </div>
      </v-col>

      <v-col cols="12" md class="h-100">
        <div class="d-flex h-100 flex-column justify-center pa-5">
          <!-- 🔴 Mensaje si ya respondió el cuestionario -->
          <div
            v-if="alreadySubmitted"
            class="pa-8 d-flex flex-column align-center justify-center text-center"
          >
            <v-icon color="error" size="60">mdi-alert-circle-outline</v-icon>
            <h2 class="text-h5 font-weight-bold mt-4 mb-2">
              Lo sentimos, solo puedes responder tu cuestionario una vez
            </h2>
            <p class="text-subtitle-1">
              En caso necesario volveremos a activarlo.<br />
              Muchas gracias por tu participación.
            </p>
            <v-btn
              class="mt-6 bg-greenShadow text-subtitle-1 catamaran-regular font-weight-bold"
              @click="goToNextOrDashboard"
            >
              Volver al inicio
            </v-btn>
          </div>

          <!-- 🟢 Recomendaciones si no ha respondido antes -->
          <v-card
            v-else-if="submission"
            elevation="5"
            color="secondary"
            class="px-6 pt-6 d-flex flex-column align-center overflow-auto"
          >
            <v-card-title class="handlee-regular text-h4 font-weight-bold">
              Tus recomendaciones:
            </v-card-title>

            <div
              v-if="!quizStore.evaluateByCategory"
              class="w-50 h-50 d-flex justify-space-around align-center mb-6"
            >
              <h2 class="handlee-regular text-h4 font-weight-regular">
                Puntaje:
              </h2>
              <span class="handlee-regular text-h4 font-weight-bold">
                {{ calification }}
              </span>
            </div>

            <div
              v-if="quizStore.evaluateByCategory"
              class="w-100 h-50 d-flex flex-column justify-space-around align-center mb-6"
            >
              <div class="mb-4">
                <h2 class="handlee-regular text-h4 font-weight-bold">
                  Puntaje:
                </h2>
              </div>
              <div class="d-flex flex-column align-center">
                <div
                  v-for="(score, category) in categories"
                  :key="category"
                  class="mb-1"
                >
                  <span class="handlee-regular text-h5 font-weight-bold">
                    {{ category }}: {{ score }}
                  </span>
                </div>
              </div>
            </div>

            <v-sheet rounded="xl" class="pa-5 mb-4 w-100">
              <RecommendationSource
                :title="quizStore.quizName"
                :assigned-at="submission.submittedAt"
              />
              <div
                v-for="(message, index) in submission.recommendations"
                :key="index"
                class="border-t mt-4 pt-4"
              >
                <p
                  v-if="message.category && message.category !== 'N/A'"
                  class="text-caption"
                >
                  {{ message.category }}
                </p>
                <p>{{ message.text }}</p>
              </div>
            </v-sheet>

            <v-card-actions class="">
              <v-btn
                class="bg-greenShadow text-subtitle-1 catamaran-regular font-weight-bold"
                @click="goToNextOrDashboard"
              >
                Siguiente
              </v-btn>
            </v-card-actions>
          </v-card>
          <NuxtLink v-else to="/user/get-help?tab=recommendations"
            >Ver mis recomendaciones</NuxtLink
          >
        </div>
      </v-col>
    </v-row>
  </div>
</template>
