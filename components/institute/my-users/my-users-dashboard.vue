<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { useInstituteStore } from '~/store/institute'
import { required } from '~/utils/helpers/form-rules'
import type { IDashboardStatisticsInstituteResponse } from '~/dto/response/institute/dashboard-statistics-institute.response.dto'
import type {
  IUserSummary,
  IPaginatedUsers,
} from '~/interfaces/user/paginated-users.interface'

const isLoading = ref(false)

const { $axios, $router } = useNuxtApp()
const authStore = useAuthStore()
const instituteStore = useInstituteStore()

const instituteIdForStats =
  authStore.user?.institute?._id || authStore.user?.institute

// Paginated users state
const users = ref<IUserSummary[]>([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const totalPages = ref(0)
const searchText = ref('')
const isLoadingUsers = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const tableHeaders = [
  { title: 'Nombre', key: 'fullName', sortable: false },
  { title: 'Email', key: 'email', sortable: false },
  { title: 'Rol', key: 'roles', sortable: false },
  { title: 'Activo', key: 'active', sortable: false },
  { title: 'Quizzes (6m)', key: 'quizCountLastSixMonths', sortable: false },
  { title: 'Último acceso', key: 'lastAccess', sortable: false },
  { title: 'Agendar cita', key: 'actions', sortable: false },
]

async function fetchUsers() {
  if (!instituteIdForStats) return
  try {
    isLoadingUsers.value = true
    const params: Record<string, string | number> = {
      page: page.value,
      limit: limit.value,
    }
    if (searchText.value.trim()) {
      params.search = searchText.value.trim()
    }
    const { data } = await $axios.get<IPaginatedUsers>(
      `/user/institute/${instituteIdForStats}`,
      { params },
    )
    users.value = data.data
    total.value = data.total
    totalPages.value = data.totalPages
  } catch (error) {
    console.error('Error fetching users', error)
  } finally {
    isLoadingUsers.value = false
  }
}

function onSearchInput() {
  searchText.value = ''
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchUsers()
  }, 400)
}

function onPageChange(newPage: number) {
  page.value = newPage
  fetchUsers()
}

function getFullName(user: IUserSummary): string {
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

onMounted(async () => {
  try {
    isLoading.value = true
    const { data } = await $axios.get<IDashboardStatisticsInstituteResponse>(
      `/institute/${instituteIdForStats}/dashboard-statistics`,
    )
    instituteStore.statistics = data
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }

  await fetchUsers()
})

const totalUsers = computed(() => instituteStore.statistics?.totalUsers)
const activeUsers = computed(() => instituteStore.statistics?.activeUsers)
const studentsUsers = computed(() => instituteStore.statistics?.studentUsers)
const administratorUsers = computed(
  () => instituteStore.statistics?.administratorUsers,
)

// Selected user & calendar logic
const selectedUser = ref<IUserSummary | null>(null)
const userSchedules = ref<{ appointmentDate: Date }[]>([])
const showScheduleDialog = ref(false)

async function onOpenSchedule(user: IUserSummary) {
  selectedUser.value = user
  try {
    const { data } = await $axios.get(`/calendary/patient/${user._id}`)
    userSchedules.value = data
  } catch (error) {
    console.error(error)
    userSchedules.value = []
  }
}

function onRowClick(_event: any, row: any) {
  const user = row.item as IUserSummary
  $router.push(`/institute/my-users/${user._id}`)
}

// Add therapy schedule
const day = ref()
const startHour = ref()
const endHour = ref()

async function saveSchedule() {
  const calendly: Ref<{
    patientId: string
    psychologistId: string
    appointmentDate: Date
    duration?: number
    timezone?: string
    appointmentType?: string
    modality?: string
    reason?: string
  }> = ref(
    {} as {
      patientId: string
      psychologistId: string
      appointmentDate: Date
      duration?: number
      timezone?: string
      appointmentType?: string
      modality?: string
      reason?: string
    },
  )

  if (selectedUser.value) {
    calendly.value.patientId = selectedUser.value._id
    calendly.value.psychologistId = selectedUser.value._id
    calendly.value.appointmentDate = new Date(day.value + 'T' + startHour.value)
    try {
      const { data } = await $axios.post(`/calendary`, {
        ...calendly.value,
      })
    } catch (error) {
      console.log(error)
    } finally {
      userSchedules.value.push({
        appointmentDate: calendly.value.appointmentDate,
      })
      showScheduleDialog.value = false
    }
  } else {
    alert('No hay un usuario seleccionado')
  }
}
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <div class="my-4">
          <h1 class="handlee-regular text-h4 font-weight-thin">Mis usuarios</h1>
        </div>
      </v-col>
      <v-col cols="12">
        <div class="my-4">
          <h2 class="handlee-regular text-h6 font-weight-thin">
            Aquí te mostramos la información de tus usuarios, tanto en
            estadísticas generales como en las particularidades de cada uno de
            tus usuarios.
          </h2>
        </div>
      </v-col>
      <v-container>
        <v-row>
          <v-col cols="12" md="6" lg="3">
            <v-card color="pa-4" rounded="xl" height="110" elevation="5">
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
            <v-card color="pa-4" rounded="xxl" height="110" elevation="5">
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
            <v-card color="pa-4" rounded="xxl" height="110" elevation="5">
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
            <v-card color="pa-4" rounded="xxl" height="110" elevation="5">
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
          <v-col cols="12">
            <v-row no-gutters class="align-center">
              <v-col cols="12" md="6" class="mb-2">
                <span class="catamaran-regular font-body-1">
                  Buscador individual por cada uno de los usuarios:
                </span>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="searchText"
                  label="Buscar por nombre, apellido o correo"
                  variant="solo-filled"
                  rounded="xxl"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  hide-details
                  @input="onSearchInput"
                  @click:clear="onSearchInput()"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" class="mt-4">
            <v-card rounded="xl" elevation="5">
              <v-data-table
                :headers="tableHeaders"
                :items="users"
                :loading="isLoadingUsers"
                :items-per-page="limit"
                hide-default-footer
                class="catamaran-regular"
                @click:row="onRowClick"
              >
                <template #item.fullName="{ item }">
                  {{ getFullName(item) }}
                </template>
                <template #item.roles="{ item }">
                  <v-chip
                    v-for="role in item.roles"
                    :key="role"
                    size="small"
                    class="me-1"
                    color="primary"
                    variant="tonal"
                  >
                    {{ role }}
                  </v-chip>
                </template>
                <template #item.active="{ item }">
                  <v-icon :color="item.active ? 'success' : 'error'">
                    {{ item.active ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                </template>
                <template #item.lastAccess="{ item }">
                  {{ formatDate(item.lastAccess) }}
                </template>
                <template #item.actions="{ item }">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    @click.stop="onOpenSchedule(item)"
                  >
                    <v-icon>mdi-calendar-plus</v-icon>
                  </v-btn>
                </template>
                <template #bottom>
                  <div class="d-flex justify-center align-center pa-4">
                    <v-pagination
                      :model-value="page"
                      :length="totalPages"
                      :total-visible="5"
                      rounded="circle"
                      @update:model-value="onPageChange"
                    />
                  </div>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
          <v-col cols="12" v-if="selectedUser" class="mt-4">
            <v-card color=" pa-2" rounded="xl" elevation="5">
              <v-container>
                <v-row>
                  <v-col cols="12" md="2">
                    <span class="handlee-regular text-h5 font-weight-thin">
                      {{ getFullName(selectedUser) }}
                    </span>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-card
                      class="pa-2 d-flex flex-column justify-center text-center h-100"
                      color=""
                      elevation="5"
                      rounded="xl"
                    >
                      <span class="handlee-regular text-h5 font-weight-thin">
                        Resultados de la última respuesta:
                      </span>
                      <span class="catamaran-regular text-h6">
                        4.5 / 5.0 de Bienestar
                      </span>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card class="pa-4" color="" elevation="5" rounded="xl">
                      <span class="handlee-regular text-h5 font-weight-thin">
                        Citas en agenda del usuario
                      </span>
                      <v-row>
                        <v-col cols="4" class="justify-center">
                          <v-img src="/calendar.png" width="40" />
                        </v-col>
                        <v-col>
                          <span
                            class="catamaran-regular text-subtitle-1 font-weight-thin"
                          >
                            {{ userSchedules.length }} citas en los próximos
                            días
                          </span>
                        </v-col>
                        <v-col
                          v-for="(schedule, i) in userSchedules"
                          :key="i"
                          cols="12"
                        >
                          <span
                            class="catamaran-regular text-subtitle-1 font-weight-thin"
                          >
                            {{
                              new Date(
                                schedule.appointmentDate,
                              ).toLocaleString()
                            }}
                            proxima cita
                          </span>
                        </v-col>
                      </v-row>
                      <v-card-actions class="d-flex flex-column flex-md-row">
                        <NuxtLink href="/institute/my-users/clinic-history">
                          <v-btn
                            class="bg-thirdy catamaran-regular text-subtitle-1 font-weight-thin"
                            elevation="5"
                            rounded="xl"
                            variant="flat"
                          >
                            Conocer historia clínica
                          </v-btn>
                        </NuxtLink>
                        <v-btn
                          class="bg-thirdy catamaran-regular text-subtitle-1 font-weight-thin"
                          elevation="5"
                          rounded="xl"
                          variant="flat"
                          @click="showScheduleDialog = true"
                        >
                          Agendar una nueva cita
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </v-col>
          <!-- Schedule dialog -->
          <v-dialog v-model="showScheduleDialog" max-width="700">
            <v-card class="px-6 pt-4">
              <v-card-title class="handlee-regular text-h4 font-weight-thin">
                Agendar nueva cita
              </v-card-title>
              <v-card-subtitle v-if="selectedUser" class="catamaran-regular">
                {{ getFullName(selectedUser) }}
              </v-card-subtitle>
              <span class="catamaran-regular text-subtitle-1 font-weight-thin">
                Día de la cita:
              </span>
              <v-text-field
                type="date"
                label="Día de la cita"
                variant="solo-filled"
                clearable
                rounded="xxl"
                v-model="day"
                :rules="[required]"
                append-inner-icon="mdi-calendar-outline"
                validate-on="lazy input"
                class="catamaran-regular text-subtitle-1 font-weight-thin"
              />
              <div class="w-100 d-flex flex-row justify-space-between">
                <div class="w-45">
                  <span
                    class="catamaran-regular text-subtitle-1 font-weight-thin"
                  >
                    Hora de inicio:
                  </span>
                  <v-text-field
                    type="time"
                    label="Hora de inicio"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    v-model="startHour"
                    :rules="[required]"
                    append-inner-icon="mdi-clock-outline"
                    validate-on="lazy input"
                    class="catamaran-regular text-subtitle-1 font-weight-thin"
                  />
                </div>
                <div class="w-45">
                  <span
                    class="catamaran-regular text-subtitle-1 font-weight-thin"
                  >
                    Hora de fin:
                  </span>
                  <v-text-field
                    type="time"
                    label="Hora de fin"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    v-model="endHour"
                    append-inner-icon="mdi-clock-outline"
                    validate-on="lazy input"
                    class="catamaran-regular text-subtitle-1 font-weight-thin"
                  />
                </div>
              </div>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  @click="saveSchedule"
                  class="bg- catamaran-regular text-subtitle-1 font-weight-thin"
                >
                  Agregar
                  <v-icon> mdi-plus </v-icon>
                </v-btn>
                <v-btn
                  class="ms-2 bg-thirdy catamaran-regular text-subtitle-1 font-weight-thin"
                  @click="showScheduleDialog = false"
                >
                  Cerrar
                  <v-icon> mdi-close </v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>
      </v-container>
    </v-row>
  </v-container>
</template>
