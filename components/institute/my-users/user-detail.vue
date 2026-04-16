<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import type {
  IUserDetail,
  IQuestionnaireResultItem,
} from '~/interfaces/user/user-detail.interface'

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

const genderLabels: Record<string, string> = {
  male: 'Masculino',
  female: 'Femenino',
  other: 'Otro',
  prefer_not_to_say: 'Prefiero no decir',
}

const campusLabels: Record<string, string> = {
  name: 'Campus',
  department: 'Departamento',
  career: 'Carrera',
}

const demoLabels: Record<string, string> = {
  postalCode: 'Código postal',
  civilStatus: 'Estado civil',
  studyYear: 'Año de estudios',
  housingSituation: 'Situación de vivienda',
  personalMonthlyIncome: 'Ingreso mensual personal',
  familyMonthlyIncome: 'Ingreso mensual familiar',
  employmentStatus: 'Situación laboral',
  healthChronicDisease: 'Enfermedad crónica',
  tabacoUse: 'Consumo de tabaco',
  alcoholCompsumptionFrequency: 'Frecuencia de consumo de alcohol',
  physicalActivityFrequency: 'Frecuencia de actividad física',
  nicotineProductUse: 'Uso de productos de nicotina',
}

const valueLabels: Record<string, string> = {
  FREE_UNION: 'Unión libre',
  SINGLE: 'Soltero/a',
  MARRIED: 'Casado/a',
  DIVORCED: 'Divorciado/a',
  WIDOWED: 'Viudo/a',
  ROOMMATES: 'Con compañeros de cuarto',
  ALONE: 'Solo/a',
  WITH_FAMILY: 'Con familia',
  WITH_PARTNER: 'Con pareja',
  BETWEEN_9000_12000: '$9,000 - $12,000',
  BETWEEN_6000_9000: '$6,000 - $9,000',
  BETWEEN_3000_6000: '$3,000 - $6,000',
  LESS_THAN_3000: 'Menos de $3,000',
  BETWEEN_12000_15000: '$12,000 - $15,000',
  MORE_THAN_15000: 'Más de $15,000',
  BETWEEN_15000_20000: '$15,000 - $20,000',
  BETWEEN_20000_30000: '$20,000 - $30,000',
  BETWEEN_30000_40000: '$30,000 - $40,000',
  BETWEEN_40000_50000: '$40,000 - $50,000',
  MORE_THAN_50000: 'Más de $50,000',
  LESS_THAN_15000: 'Menos de $15,000',
  MORE_THAN_20_HOURS_WEEK: 'Más de 20 hrs/semana',
  LESS_THAN_20_HOURS_WEEK: 'Menos de 20 hrs/semana',
  UNEMPLOYED: 'Sin empleo',
  ONCE_PER_WEEK: 'Una vez por semana',
  TWICE_PER_WEEK: 'Dos veces por semana',
  THREE_OR_MORE_PER_WEEK: 'Tres o más veces por semana',
  ONCE_PER_MONTH: 'Una vez al mes',
  NEVER: 'Nunca',
  DAILY: 'Diario',
  '1_TO_4_HOURS_PER_WEEK': '1 a 4 horas por semana',
  '5_TO_8_HOURS_PER_WEEK': '5 a 8 horas por semana',
  MORE_THAN_8_HOURS_PER_WEEK: 'Más de 8 horas por semana',
  NONE: 'Ninguna',
}

function translateValue(val: any): string {
  if (typeof val === 'boolean') return val ? 'Sí' : 'No'
  if (typeof val === 'string') return valueLabels[val] || val
  return String(val)
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
