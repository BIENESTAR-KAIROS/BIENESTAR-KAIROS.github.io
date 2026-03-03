<script setup lang="ts">
import type { IRecomendations } from '~/interfaces/recomendations/recomendations.interface'
import { useAuthStore } from '~/store/auth'
import { useQuizStore, type IQuizResponse } from '~/store/quiz'
import { useQuestionnaireQueue } from '~/composables/useQuestionnaireQueue'

const { $axios } = useNuxtApp()
const quizStore = useQuizStore()
const authStore = useAuthStore()
const { $router } = useNuxtApp()
const { resolveNextQuestionnaire, getQuestionnaireRoute } =
  useQuestionnaireQueue()

const sum = ref(0)
const calification = computed(() => {
  sum.value = 0
  const suma = (question: IQuizResponse): Number => {
    const temp = ref(0)
    temp.value += Number(question.answer) < 0 ? 0 : Number(question.answer)
    question.options.forEach((option) => {
      option.subquestions?.forEach((sub) => {
        temp.value += Number(suma(sub))
      })
    })
    return Number(temp.value)
  }

  quizStore.quiz.forEach((question) => {
    sum.value += Number(suma(question))
  })

  return Number(sum.value)
})

const isLoading = ref(false)
const recomendations = ref([] as IRecomendations[])
const route = useRoute()
const alreadySubmitted = ref(route.query.alreadySubmitted === 'true')

const claves = ref<Record<string, string>>({
  '6865871136aa0b3c141cf766': 'PHQ',
  '687f24aa1c222766e367ff24': 'GAD',
  '687f3d331c222766e367ff26': 'ASST',
})

// Función para verificar si es error 409
const isError409 = (error: any): boolean => {
  return (
    error?.response?.status === 409 ||
    error?.status === 409 ||
    error?.statusCode === 409 ||
    error?.response?.data?.statusCode === 409 ||
    error?.data?.statusCode === 409
  )
}

const goToNextOrDashboard = async () => {
  try {
    const { nextQuestionnaireId } = await resolveNextQuestionnaire()

    if (nextQuestionnaireId) {
      await $router.push(getQuestionnaireRoute(nextQuestionnaireId))
      return
    }

    await $router.push('/user/dashboard')
  } catch (error) {
    console.error('Error resolving next questionnaire on finish:', error)
    await $router.push('/user/dashboard')
  }
}

onMounted(async () => {
  isLoading.value = true

  try {
    // Si ya se detectó que respondió antes, no hacer nada más
    if (alreadySubmitted.value) {
      return
    }

    // 1. Determinar categoría
    let category = claves.value[quizStore.quiz[0].questionnaireId]
    if (category === 'PHQ') {
      if (sum.value < 5) category += '0001'
      else if (sum.value < 10) category += '0002'
      else if (sum.value < 15) category += '0003'
      else category += '0004'
    } else if (category === 'GAD') {
      if (sum.value < 5) category += '0001'
      else if (sum.value < 10) category += '0002'
      else if (sum.value < 15) category += '0003'
      else category += '0004'
    } else if (category === 'ASST') {
      if (sum.value < 35) category += '0004'
      else if (sum.value < 270) category += '0005'
      else category += '0006'
    }

    let fallback = false

    // 2. Intentar obtener recomendación específica si aplica
    if (
      quizStore.quiz[0].questionnaireId !== '687eb71ad314bf6498877687' &&
      category
    ) {
      try {
        if (authStore.user) {
          const response = await $axios.get(
            `/user-recommendation/${authStore.user._id}/`,
          )
          recomendations.value =
            response.data.userRecommendation.recommendationIds
        }
      } catch (error: any) {
        if (isError409(error)) {
          console.log('🚨 Ya habías respondido el cuestionario.')
          alreadySubmitted.value = true
          return
        } else {
          // Si no es 409, usar fallback
          console.warn('⚠️ Error obteniendo recomendación específica:', error)
          fallback = true
        }
      }
    } else {
      fallback = true
    }

    // 3. Obtener recomendaciones aleatorias
    /* const count = fallback ? 4 : 3
    for (let i = 0; i < count; i++) {
      try {
        const response = await $axios.get(`/recommendations/random`)
        recomendations.value.push(response.data)
      } catch (error: any) {
        if (isError409(error)) {
          console.log('🚨 Ya habías respondido (en aleatoria).')
          alreadySubmitted.value = true
          return
        } else {
          console.warn(
            `⚠️ Error obteniendo recomendación aleatoria ${i + 1}:`,
            error,
          )
          // Continuar con las siguientes recomendaciones aleatorias
        }
      }
    } */
  } catch (err: any) {
    console.error('⚠️ Error inesperado:', err)
    // Solo marcar como ya respondido si es específicamente un 409
    if (isError409(err)) {
      alreadySubmitted.value = true
    } else {
      // Para otros errores, podrías mostrar un mensaje diferente
      // o manejar de otra manera según tu lógica de negocio
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <!-- Pantalla de carga -->
  <div v-show="isLoading" class="w-100 h-100">
    <div class="w-100 h-100 d-flex justify-center align-center">
      <v-progress-circular color="primary" indeterminate></v-progress-circular>
    </div>
  </div>

  <!-- Pantalla principal cuando ya cargó -->
  <div v-show="!isLoading">
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
            v-if="!alreadySubmitted"
            elevation="5"
            color="secondary"
            class="px-6 pt-6 d-flex flex-column align-center overflow-auto"
          >
            <v-card-title class="handlee-regular text-h4 font-weight-bold">
              Tus recomendaciones:
            </v-card-title>

            <div
              v-if="
                quizStore.quiz[0].questionnaireId != '687eb71ad314bf6498877687'
              "
              class="w-50 h-50 d-flex justify-space-around align-center mb-6"
            >
              <h2 class="handlee-regular text-h4 font-weight-regular">
                Puntaje:
              </h2>
              <span class="handlee-regular text-h4 font-weight-bold">
                {{ calification }}
              </span>
            </div>

            <v-row>
              <v-col
                v-for="(recomendation, i) in recomendations"
                :key="i"
                cols="12"
                md="3"
              >
                <v-sheet
                  rounded="xl"
                  class="px-4 py-4 pt-5 d-flex flex-column justify-space-around align-center text-center h-100"
                  :elevation="5"
                >
                  <div class="mb-9">
                    <span class="text-body-1 catamaran-regular">
                      {{ recomendation.recommendation }}
                    </span>
                  </div>
                  <span class="text-body-1 catamaran-regular">
                    <span
                      class="text-body-1 catamaran-regular font-weight-bold"
                    >
                      Categoría:
                    </span>
                    {{ recomendation.category }}
                  </span>
                </v-sheet>
              </v-col>
            </v-row>

            <v-row>
              <v-col
                class="w-100 h-50 d-flex justify-space-around align-center mb-6"
              >
                <span class="handlee-regular text-h4 font-weight-bold">
                  Recomendación especial:
                </span>
              </v-col>
              <v-col
                class="w-100 h-50 d-flex justify-space-around align-center mb-6"
              >
                <h2 class="handlee-regular font-weight-regular">
                  Recuerda que puedes acercarte a la Unidad de Psicología
                  Clínica de la UP para que te orienten sobre tu bienestar.
                </h2>
              </v-col>
            </v-row>

            <v-card-actions class="">
              <v-btn
                class="bg-greenShadow text-subtitle-1 catamaran-regular font-weight-bold"
                @click="goToNextOrDashboard"
              >
                Volver al inicio
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </div>
</template>
