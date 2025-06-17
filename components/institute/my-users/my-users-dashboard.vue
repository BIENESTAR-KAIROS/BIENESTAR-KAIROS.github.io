<script setup lang="ts">
import DailyAnswerVolume from '../dashboard/daily-answer-volume.vue'
import AnswerByGender from './answer-by-gender.vue'
import AnswerByAge from './answer-by-age.vue'
import { useAuthStore } from '~/store/auth'
import { useInstituteStore } from '~/store/institute'
import type { IStatsResponse } from '~/interfaces/stats/stats.interface'
import type { IUser } from '~/interfaces/users/user.interface'

const days = ref([8, 15, 30, 90])
const selectedDays = ref(30)

const calendar = ref()

const isLoading = ref(false)

const { $axios } = useNuxtApp()
const authStore = useAuthStore()
const instituteStore = useInstituteStore()

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

const search = ref(null)
const studentOptions = ref([] as string[])
const isSearchedUser = ref(false)
const users = ref([] as IUser[])

onMounted(async () => {
  try {
    isLoading.value = true
    const { data } = await $axios.get<{ users: IUser[] }>(
      `/users?institutionId=${authStore.user?.institution?.id}&type=student&active=true`,
    )
    users.value = data.users
    users.value.map((user) =>
      studentOptions.value.push(
        `${user.profile?.name} ${user.profile?.lastName}`,
      ),
    )
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
})

const selectedUser = ref(null as IUser | null)

async function onSearch() {
  if (search.value) {
    isSearchedUser.value = true
    selectedUser.value =
      users.value.find(
        (user) =>
          search.value === `${user.profile?.name} ${user.profile?.lastName}`,
      ) || null
  }
}

const calendarType = ref('month')
const value = ref([new Date().toISOString().substr(0, 10)])
function schedule(event) {
  console.log(event)

  console.log(calendar)
  console.log(value.value)
}
const day = ref(new Date().toISOString().substr(0, 10))
function viewDay({ date }) {
  day.value = date
  calendarType.value = 'day'

  console.log(calendar)
  console.log(value.value)
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
              rounded="xxl"
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
              rounded="xxl"
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
              rounded="xxl"
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
                  Volumen de respuestas por género
                </span>
                <div class="d-flex flex-row align-center h-85">
                  <AnswerByGender />
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
                  Volumen de respuestas por edad
                </span>
                <div class="d-flex flex-row align-center h-85 w-85">
                  <AnswerByAge />
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-row no-gutters>
              <v-col cols="12" md="" lg="" class="mb-2">
                <span class="catamaran-regular font-body-1">
                  Buscador individual por cada uno de los usuarios:
                </span>
              </v-col>
              <v-col cols="12" md="" lg="">
                <v-autocomplete
                  v-model="search"
                  label="Ingresa nombre o apellido a buscar"
                  :items="studentOptions"
                  variant="solo-filled"
                  bg-color="purpleShadow"
                  rounded="xxl"
                  @update:search="onSearch"
                ></v-autocomplete>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" v-if="isSearchedUser">
            <v-card color="purpleShadow pa-2" rounded="xl" elevation="5">
              <v-container>
                <v-row>
                  <v-col cols="12" md="4">
                    <span class="handlee-regular text-h5 font-weight-thin">
                      {{
                        `${selectedUser?.profile?.name} ${selectedUser?.profile?.lastName}`
                      }}
                    </span>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-card
                      class="pa-2 d-flex flex-column justify-center text-center h-100"
                      color="purpleShadow"
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
                  <v-col cols="12" md="4">
                    <v-card
                      class="pa-4"
                      color="purpleShadow"
                      elevation="5"
                      rounded="xl"
                    >
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
                            1 cita en los próximos días
                          </span>
                        </v-col>
                      </v-row>
                      <v-card-actions>
                        <v-spacer />
                        <v-dialog max-width="700">
                          <template
                            v-slot:activator="{ props: activatorProps }"
                          >
                            <v-btn
                              v-bind="activatorProps"
                              class="bg-thirdy"
                              elevation="5"
                              rounded="xl"
                              variant="flat"
                            >
                              Agendar una nueva cita
                            </v-btn>
                          </template>

                          <template v-slot:default="{ isActive }">
                            <v-card title="Citas del mes" class="pa-4">
                              <v-text-field type="datetime-local" />

                              <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                  text="Agregar"
                                  @click="isActive.value = false"
                                ></v-btn>
                                <v-btn
                                  text="Cerrar"
                                  @click="isActive.value = false"
                                ></v-btn>
                              </v-card-actions>
                            </v-card>
                          </template>
                        </v-dialog>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
  </v-container>
</template>
