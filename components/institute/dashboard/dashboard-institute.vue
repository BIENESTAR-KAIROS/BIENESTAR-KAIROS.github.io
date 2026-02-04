<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import DailyAnswerVolume from './daily-answer-volume.vue'
import ResolvedQuizzes from './resolved-quizzes.vue'
import TerapyBalance from './terapy-balance.vue'
import type { IStatsResponse } from '~/interfaces/stats/stats.interface'
import { useInstituteStore } from '~/store/institute'
import type { IDashboardStatisticsInstituteResponse } from '~/dto/response/institute/dashboard-statistics-institute.response.dto'

const days = [30, 90, 15, 8]
const selectedDays = ref(days[0])

const { $axios } = useNuxtApp()
const authStore = useAuthStore()
const instituteStore = useInstituteStore()

const isLoading = ref(false)

onMounted(async () => {
  try {
    isLoading.value = true
    console.log(authStore.user)

    const { data } = await $axios.get<IDashboardStatisticsInstituteResponse>(
      `/institute/${authStore.user?.institute?._id}/dashboard-statistics`,
    )
    // TODO remove log and fix user admnin slots available

    console.log(data)

    instituteStore.statistics = data
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
})

const totalUsers = computed(() => instituteStore.statistics?.totalUsers)
const activeUsers = computed(() => instituteStore.statistics?.activeUsers)
const studentsUsers = computed(() => instituteStore.statistics?.studentUsers)
const administratorUsers = computed(
  () => instituteStore.statistics?.administratorUsers,
)
const adminAvialible = computed(
  () => instituteStore.statistics?.adminSlotsAvailable,
)
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <div class="my-4">
          <h1 class="handlee-regular text-h4 font-weight-thin">
            ¡Bienvenido de nuevo,
            {{ authStore.user?.name + ' ' + authStore.user?.lastName }}!
          </h1>
        </div>
      </v-col>
      <v-col cols="12">
        <div class="my-4">
          <h2 class="handlee-regular text-h6 font-weight-thin">
            Esta es la información general de tu población y sus parámetros, son
            aquellos detalles que Kairos considera que debes de saber de tu
            población, si quieres ver información a tu medida, accede a “Mis
            estadísticas”.
          </h2>
        </div>
      </v-col>
      <v-container>
        <!--
        <v-row no-gutters>
          <v-col cols="12">
            <v-row no-gutters>
              <v-col cols="5" lg="3">
                <span class="catamaran-regular font-body-1">
                  Datos referenciados de los últimos:
                </span>
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
      -->
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
