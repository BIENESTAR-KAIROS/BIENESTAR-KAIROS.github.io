<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import type {
  IUserDetail,
  IQuestionnaireResultItem,
} from '~/interfaces/user/user-detail.interface'
import {
  genderLabels,
  campusLabels,
  demoLabels,
  translateValue,
} from '~/utils/translations'

const { $axios, $router, $Swal } = useNuxtApp()
const route = useRoute()
const authStore = useAuthStore()

const userId = route.params.userId as string
const instituteId = authStore.user?.institute?._id || authStore.user?.institute

const userDetail = ref<IUserDetail | null>(null)
const isLoading = ref(false)
const errorMsg = ref('')

const resultHeaders = [
  { title: 'Cuestionario', key: 'questionnaireTitle', sortable: false },
  { title: 'Score', key: 'score', sortable: false },
  { title: 'Fecha', key: 'createdAt', sortable: false },
]

async function fetchUserDetail() {
  if (!instituteId) return
  try {
    isLoading.value = true
    const { data } = await $axios.get<IUserDetail>(
      `/user/${userId}/institute/${instituteId}`,
    )
    userDetail.value = data
  } catch (error: any) {
    console.error('Error fetching user detail', error)
    errorMsg.value =
      error?.response?.data?.message ||
      'Error al obtener la información del usuario'
  } finally {
    isLoading.value = false
  }
}

function getFullName(user: IUserDetail): string {
  return [user.name, user.lastName, user.surName].filter(Boolean).join(' ')
}

function formatDate(date?: Date | string): string {
  if (!date) return 'Sin registro'
  return new Date(date).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function showCampusInfo() {
  const campus = userDetail.value?.studentData?.campusInformation
  if (!campus) return
  let html = ''
  for (const [key, val] of Object.entries(campus as Record<string, any>)) {
    html += `<p style="margin:4px 0;font-family:Catamaran,sans-serif;"><strong>${campusLabels[key] || key}:</strong> ${translateValue(val)}</p>`
  }
  ;($Swal as any).fire({
    title: 'Información del campus',
    html: html || '<p>Sin datos de campus</p>',
    confirmButtonText: 'Cerrar',
    confirmButtonColor: '#6CC5CB',
    width: 500,
    customClass: { title: 'handlee-regular', htmlContainer: 'text-left' },
  })
}

function showDemographicData() {
  const demo = userDetail.value?.studentData?.demographicData
  if (!demo) return
  let html = ''
  for (const [key, val] of Object.entries(demo as Record<string, any>)) {
    html += `<p style="margin:4px 0;font-family:Catamaran,sans-serif;"><strong>${demoLabels[key] || key}:</strong> ${translateValue(val)}</p>`
  }
  ;($Swal as any).fire({
    title: 'Datos demográficos',
    html: html || '<p>Sin datos demográficos</p>',
    confirmButtonText: 'Cerrar',
    confirmButtonColor: '#6CC5CB',
    width: 550,
    customClass: { title: 'handlee-regular', htmlContainer: 'text-left' },
  })
}

onMounted(() => {
  fetchUserDetail()
})
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12" class="mb-4">
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          class="catamaran-regular"
          @click="$router.push('/institute/my-users')"
        >
          Volver a mis usuarios
        </v-btn>
      </v-col>

      <v-col cols="12" v-if="isLoading">
        <div class="d-flex justify-center pa-8">
          <v-progress-circular indeterminate color="primary" />
        </div>
      </v-col>

      <v-col cols="12" v-else-if="errorMsg">
        <v-alert type="error" class="catamaran-regular">
          {{ errorMsg }}
        </v-alert>
      </v-col>

      <template v-else-if="userDetail">
        <v-col cols="12">
          <div class="my-2">
            <h1 class="handlee-regular text-h4 font-weight-thin">
              {{ getFullName(userDetail) }}
            </h1>
          </div>
        </v-col>

        <v-col cols="12" class="mt-2">
          <v-card rounded="xl" elevation="5" class="pa-4">
            <v-row>
              <v-col cols="12" md="6">
                <div class="d-flex flex-column ga-2">
                  <span class="catamaran-regular text-subtitle-1">
                    <strong>Email:</strong> {{ userDetail.email }}
                  </span>
                  <span class="catamaran-regular text-subtitle-1">
                    <strong>Roles:</strong>
                    <v-chip
                      v-for="role in userDetail.roles"
                      :key="role"
                      size="small"
                      class="ms-1"
                      color="primary"
                      variant="tonal"
                    >
                      {{ role }}
                    </v-chip>
                  </span>
                  <span class="catamaran-regular text-subtitle-1">
                    <strong>Estado:</strong>
                    <v-icon
                      :color="userDetail.active ? 'success' : 'error'"
                      size="small"
                    >
                      {{
                        userDetail.active
                          ? 'mdi-check-circle'
                          : 'mdi-close-circle'
                      }}
                    </v-icon>
                    {{ userDetail.active ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="d-flex flex-column ga-2">
                  <span class="catamaran-regular text-subtitle-1">
                    <strong>Fecha de registro:</strong>
                    {{ formatDate(userDetail.registrationDate) }}
                  </span>
                  <span class="catamaran-regular text-subtitle-1">
                    <strong>Último acceso:</strong>
                    {{ formatDate(userDetail.lastAccess) }}
                  </span>
                </div>
              </v-col>
              <v-col cols="12" md="6" v-if="userDetail.studentData">
                <div class="d-flex flex-column ga-2">
                  <span class="catamaran-regular text-subtitle-1">
                    <strong>Edad:</strong>
                    {{ userDetail.studentData.age ?? 'Sin registro' }}
                  </span>
                  <span class="catamaran-regular text-subtitle-1">
                    <strong>Género:</strong>
                    {{
                      genderLabels[userDetail.studentData.gender] ||
                      userDetail.studentData.gender ||
                      'Sin registro'
                    }}
                  </span>
                  <span class="catamaran-regular text-subtitle-1">
                    <strong>Encuesta demográfica:</strong>
                    <v-icon
                      :color="
                        userDetail.studentData.demographicSurveyCompleted
                          ? 'success'
                          : 'error'
                      "
                      size="small"
                    >
                      {{
                        userDetail.studentData.demographicSurveyCompleted
                          ? 'mdi-check-circle'
                          : 'mdi-close-circle'
                      }}
                    </v-icon>
                    {{
                      userDetail.studentData.demographicSurveyCompleted
                        ? 'Completada'
                        : 'No completada'
                    }}
                  </span>
                </div>
              </v-col>
              <v-col
                cols="12"
                class="d-flex justify-end ga-2"
                v-if="userDetail.studentData"
              >
                <v-btn
                  color="thirdy"
                  variant="tonal"
                  rounded="xl"
                  class="catamaran-regular"
                  prepend-icon="mdi-school"
                  @click="showCampusInfo"
                >
                  Información del campus
                </v-btn>
                <v-btn
                  color="thirdy"
                  variant="tonal"
                  rounded="xl"
                  class="catamaran-regular"
                  prepend-icon="mdi-chart-bar"
                  @click="showDemographicData"
                >
                  Datos demográficos
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <v-col cols="12" class="mt-6">
          <h2 class="handlee-regular text-h5 font-weight-thin mb-4">
            Cuestionarios realizados
          </h2>
          <v-card rounded="xl" elevation="5">
            <v-data-table
              :headers="resultHeaders"
              :items="userDetail.questionnaireResults"
              :items-per-page="10"
              class="catamaran-regular"
              no-data-text="Este usuario no ha realizado cuestionarios"
            >
              <template #item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>
