<script setup lang="ts">
import { type IRecomendations } from '~/interfaces/recomendations/recomendations.interface'

const { $axios } = useNuxtApp()

const isLoading = ref(false)
const recomendations = ref([] as IRecomendations[])

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
</script>

<template>
  <div v-show="isLoading" class="w-100 h-100">
    <div class="w-100 h-100 d-flex justify-center align-center">
      <v-progress-circular color="primary" indeterminate></v-progress-circular>
    </div>
  </div>
  <div v-show="!isLoading">
    <v-container>
      <v-row>
        <v-col cols="12">
          <div class="my-4">
            <h1 class="handlee-regular text-h3 font-weight-regular">
              Recomendaciones personalizadas
            </h1>
          </div>
        </v-col>
        <v-col cols="12">
          <div class="my-4">
            <h2 class="handlee-regular text-h5 font-weight-regular">
              Estas son algunas recomendaciones de Kairos con base en tus
              resultados y tu perfil personal
            </h2>
          </div>
        </v-col>
      </v-row>
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
              <span class="text-body-1 catamaran-regular font-weight-bold">
                Categoría:
              </span>
              {{ recomendation.category }}
            </span>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
