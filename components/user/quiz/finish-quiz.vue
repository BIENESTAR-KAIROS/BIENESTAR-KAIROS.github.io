<script setup lang="ts">
import type { IRecomendations } from '~/interfaces/recomendations/recomendations.interface'
import { useQuizStore } from '~/store/quiz'

const { $axios } = useNuxtApp()
const quizStore = useQuizStore()

const sum = ref(0)
const calification = () => {
  quizStore.quiz.forEach((question) => {
    sum.value += question.answer
  })

  return Math.round((sum.value / quizStore.totalQUestions) * 10) / 10
}

const isLoading = ref(false)
const recomendations = ref([] as IRecomendations[])

onMounted(async () => {
  try {
    isLoading.value = true
    for (let index = 0; index < 4; index++) {
      const { data } = await $axios.get<IRecomendations>(
        `/recommendations/random`,
      )

      recomendations.value.push(data)
    }
  } catch (error) {
    console.log(error)
    alert('Error al obtener tus recomendaciones.')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div v-show="isLoading" class="w-100 h-100">
    <div class="w-100 h-100 d-flex justify-center align-center">
      <v-progress-circular color="primary" indeterminate></v-progress-circular>
    </div>
  </div>
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
      <v-col cols="12" md="" class="h-100">
        <div class="d-flex h-100 flex-column justify-center pa-5">
          <v-card
            elevation="5"
            color="secondary"
            class="px-6 pt-6 d-flex flex-column justify-center align-center"
          >
            <v-card-title class="handlee-regular text-h2 font-weight-bold">
              Tus resultados:
            </v-card-title>
            <div
              class="w-50 h-50 d-flex justify-space-around align-center mb-6"
            >
              <span class="handlee-regular text-h4 font-weight-bold">
                {{ calification }} / 5.0
              </span>
              <h2 class="handlee-regular text-h4 font-weight-regular">
                Bienestar general
              </h2>
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
            <v-card-actions class="mt-3">
              <NuxtLink href="/user/dashboard" class="h-100">
                <v-btn
                  class="bg-greenShadow text-subtitle-1 catamaran-regular font-weight-bold"
                >
                  Volver al inicio
                </v-btn>
              </NuxtLink>
            </v-card-actions>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </div>
</template>
