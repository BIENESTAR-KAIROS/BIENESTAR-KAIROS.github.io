<script setup lang="ts">
import CalendarRecomendations from '~/components/user/recomendations/calendar-recomendations.vue'
import type { ITrackingTask } from '~/interfaces/tracking/tracking-task.interface'
import type { ITrackingToggleResponse } from '~/interfaces/tracking/tracking-toggle.interface'
import { useAuthStore } from '~/store/auth'

const { $axios } = useNuxtApp()

const isLoading = ref(false)
const recomendations = ref([] as ITrackingTask[])
const togglingRecommendationIds = ref([] as string[])
const authStore = useAuthStore()

const isToggling = (recommendationId: string): boolean =>
  togglingRecommendationIds.value.includes(recommendationId)

const getShortRecommendation = (
  recommendation: string,
  maxLength = 35,
): string => {
  if (recommendation.length <= maxLength) {
    return recommendation
  }

  return `${recommendation.slice(0, maxLength)}...`
}

const toggleRecommendation = async (recommendationId: string) => {
  try {
    togglingRecommendationIds.value.push(recommendationId)

    const response = await $axios.post('/tracking/toggle', { recommendationId })

    const toggleResult = response.data as ITrackingToggleResponse

    recomendations.value = recomendations.value.map((item) => {
      if (item.recommendationId !== recommendationId) {
        return item
      }

      return {
        ...item,
        isCompleted: toggleResult.completed,
      }
    })
  } catch (error) {
    console.log(error)
    alert('Error al registrar el estado de la recomendacion.')
  } finally {
    togglingRecommendationIds.value = togglingRecommendationIds.value.filter(
      (id) => id !== recommendationId,
    )
  }
}

onMounted(async () => {
  try {
    isLoading.value = true

    if (authStore.user) {
      const response = await $axios.get('/tracking/today')
      recomendations.value = response.data as ITrackingTask[]
    }
  } catch (error) {
    console.log(error)
    alert('Error al obtener tus tareas de hoy.')
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
    <v-container>
      <v-row no-gutters>
        <v-col cols="12">
          <div class="my-4">
            <h1 class="handlee-regular text-h3 font-weight-regular">
              Recomendaciones personalizadas
            </h1>
          </div>
        </v-col>
        <v-col cols="12">
          <div class="my-2">
            <h2 class="handlee-regular text-h5 font-weight-regular">
              Estas son algunas recomendaciones de Kairos con base en tus
              resultados y tu perfil personal
            </h2>
          </div>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col cols="12">
          <CalendarRecomendations />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <div class="my-2">
            <h2 class="handlee-regular text-h4 font-weight-bold">
              Tus recomendaciones
            </h2>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          v-for="(recomendation, i) in recomendations"
          :key="recomendation.recommendationId || i"
          cols="12"
          md="3"
        >
          <v-card
            rounded="xl"
            class="px-4 py-4 pt-5 d-none d-md-flex flex-column justify-space-between h-100"
            :elevation="5"
          >
            <div>
              <div class="mb-5 text-center">
                <span class="text-body-1 catamaran-regular font-weight-bold">
                  Basado en: {{ recomendation.category }}
                </span>
              </div>
              <div class="mb-7 text-center">
                <span class="text-body-1 catamaran-regular">
                  {{ recomendation.recommendation }}
                </span>
              </div>
            </div>
            <v-card-actions>
              <v-btn
                block
                color="greenShadow"
                class="catamaran-regular font-weight-bold"
                :disabled="
                  recomendation.isCompleted ||
                  isToggling(recomendation.recommendationId)
                "
                :loading="isToggling(recomendation.recommendationId)"
                @click="toggleRecommendation(recomendation.recommendationId)"
              >
                Hecho!
              </v-btn>
            </v-card-actions>
          </v-card>

          <v-expansion-panels class="d-md-none">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <div
                  class="w-100 d-flex align-center justify-space-between ga-2"
                >
                  <div class="d-flex flex-column">
                    <span
                      class="text-subtitle-2 catamaran-regular font-weight-bold"
                    >
                      Basado en: {{ recomendation.category }}
                    </span>
                    <span
                      class="text-body-2 catamaran-regular text-decoration-underline"
                    >
                      {{
                        getShortRecommendation(recomendation.recommendation, 50)
                      }}
                    </span>
                  </div>
                  <v-btn
                    size="small"
                    color="greenShadow"
                    class="catamaran-regular font-weight-bold"
                    :disabled="
                      recomendation.isCompleted ||
                      isToggling(recomendation.recommendationId)
                    "
                    :loading="isToggling(recomendation.recommendationId)"
                    @click.stop="
                      toggleRecommendation(recomendation.recommendationId)
                    "
                  >
                    Hecho!
                  </v-btn>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <span class="text-body-2 catamaran-regular">
                  {{ recomendation.recommendation }}
                </span>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
