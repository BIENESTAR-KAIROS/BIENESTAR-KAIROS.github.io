<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import DailyAnswerVolume from '../dashboard/daily-answer-volume.vue'
import ResolvedQuizzes from '../dashboard/resolved-quizzes.vue'
import TerapyBalance from '../dashboard/terapy-balance.vue'
import type { IStatsResponse } from '~/interfaces/stats/stats.interface'
import { useInstituteStore } from '~/store/institute'

const days = [30, 90, 15, 8]
const selectedDays = ref(days[0])

const { $axios } = useNuxtApp()
const authStore = useAuthStore()
const instituteStore = useInstituteStore()

const isLoading = ref(false)

try {
  isLoading.value = true
  const { data } = await $axios.get<IStatsResponse>(
    `/institute/${authStore.user?.institution?.id}/statistics`,
  )
  instituteStore.statistics = data
} catch (error) {
  console.log(error)
} finally {
  isLoading.value = false
}

const totalUsers = computed(() => instituteStore.statistics?.users?.total)
const activeUsers = computed(() => instituteStore.statistics?.users?.active)
const studentsUsers = computed(() => instituteStore.statistics?.users?.students)
const administratorUsers = computed(
  () => instituteStore.statistics?.users?.administrators,
)
const adminAvialible = computed(
  () => instituteStore.statistics?.users?.adminSlotsAvailable,
)
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <div class="my-4">
          <h1 class="handlee-regular text-h4 font-weight-thin">
            Mis estadísticas
          </h1>
        </div>
      </v-col>
      <v-col cols="12">
        <div class="my-4">
          <h2 class="handlee-regular text-h6 font-weight-thin">
            Aquí podrás crear filtros personalizados para obtener estadísticas
            más exactas de tu población y su comportamiento.
          </h2>
        </div>
      </v-col>
      <v-container>
        <v-row no-gutters>
          <v-col cols="12">
            <v-row no-gutters>
              <v-col cols="5" lg="3">
                <span class="catamaran-regular font-body-1"
                  >Datos referenciados de los últimos:</span
                >
              </v-col>
              <v-col cols="3" md="2" lg="1">
                <v-select
                  label="días"
                  :items="days"
                  variant="solo"
                  bg-color="purpleShadow"
                  v-model="selectedDays"
                  rounded="xxxl"
                >
                </v-select>
              </v-col>
              <v-col>
                <span class="ms-2 catamaran-regular font-body-1">días.</span>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="6" lg="3">
            <v-card
              color="purpleShadow pa-4"
              rounded="xl"
              height="110"
              elevation="5"
            >
              <div
                class="d-flex flex-column justify-space-evenly align-center h-100"
              >
                <span class="catamaran-regular font-body-1">
                  Total de usuarios
                </span>
                <div class="d-flex flex-row align-center">
                  <!-- <v-icon class="text-success me-2 text-h3 font-weight-bold">
                    mdi-arrow-up
                  </v-icon> -->
                  <span class="catamaran-regular text-h5">
                    {{ totalUsers }}
                  </span>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card
              color="purpleShadow pa-4"
              rounded="xl"
              height="110"
              elevation="5"
            >
              <div
                class="d-flex flex-column justify-space-evenly align-center h-100"
              >
                <span class="catamaran-regular font-body-1">
                  Usuarios activos
                </span>
                <div class="d-flex flex-row align-center">
                  <!-- <v-icon class="text-success me-2 text-h3 font-weight-bold">
                    mdi-arrow-up
                  </v-icon> -->
                  <span class="catamaran-regular text-h5">
                    {{ activeUsers }}
                  </span>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card
              color="purpleShadow pa-4"
              rounded="xl"
              height="110"
              elevation="5"
            >
              <div
                class="d-flex flex-column justify-space-evenly align-center h-100"
              >
                <span class="catamaran-regular font-body-1"> Estudiantes </span>
                <div class="d-flex flex-row align-center">
                  <!-- <v-icon class="text-error me-2 text-h3 font-weight-bold">
                    mdi-arrow-down
                  </v-icon> -->
                  <span class="catamaran-regular text-h5">
                    {{ studentsUsers }}
                  </span>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card
              color="purpleShadow pa-4"
              rounded="xl"
              height="110"
              elevation="5"
            >
              <div
                class="d-flex flex-column justify-space-evenly align-center h-100"
              >
                <span class="catamaran-regular font-body-1">
                  Administradores
                </span>
                <div class="d-flex flex-row align-center">
                  <!-- <v-icon class="text-success me-2 text-h3 font-weight-bold">
                    mdi-arrow-up
                  </v-icon> -->
                  <span class="catamaran-regular text-h5">
                    {{ administratorUsers }}
                  </span>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="4">
            <v-card
              color="purpleShadow pa-4"
              rounded="xl"
              height="250"
              elevation="5"
            >
              <div
                class="d-flex flex-column justify-space-evenly align-center h-100 text-center"
              >
                <span class="catamaran-regular font-body-1">
                  Volumen diario de respuestas
                </span>
                <div class="d-flex flex-row align-center">
                  <DailyAnswerVolume />
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card
              color="purpleShadow pa-4"
              rounded="xl"
              height="250"
              elevation="5"
            >
              <div
                class="d-flex flex-column justify-space-evenly align-center h-100 text-center"
              >
                <span class="catamaran-regular font-body-1">
                  Balance de terapias internas y externas
                </span>
                <div class="d-flex flex-row align-center h-85">
                  <TerapyBalance />
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card
              color="purpleShadow pa-4"
              rounded="xl"
              height="250"
              elevation="5"
            >
              <div
                class="d-flex flex-column justify-space-evenly align-center h-100 text-center"
              >
                <span class="catamaran-regular font-body-1">
                  Balance de cuestionarios resueltos
                </span>
                <div class="d-flex flex-row align-center h-85 w-85">
                  <ResolvedQuizzes />
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="2">
            <v-card
              color="purpleShadow pa-4"
              rounded="xl"
              height="250"
              elevation="5"
            >
              <div
                class="d-flex flex-column justify-space-evenly align-center h-100 text-center"
              >
                <span class="catamaran-regular font-body-1">
                  Espacios de administración disponibles
                </span>
                <div
                  class="d-flex flex-row align-center justify-center h-85 w-85"
                >
                  <span class="catamaran-regular text-h3">
                    {{ adminAvialible }}
                  </span>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
  </v-container>
</template>
