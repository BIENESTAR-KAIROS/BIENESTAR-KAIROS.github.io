<script setup lang="ts">
import type { InstituteCampusInformation } from '~/interfaces/institute/institute-campus-information.interface'
import type { IInstitute } from '~/interfaces/institute/institute.interface'
import type { StudentCampusData } from '~/interfaces/user/user-student-compus-data.interface'
import { useAuthStore } from '~/store/auth'
import { useUserStore } from '~/store/user'
import { required } from '~/utils/helpers/form-rules'

definePageMeta({
  layout: 'empty-login',
})

const authStore = useAuthStore()
const userStore = useUserStore()
const nuxtApp = useNuxtApp()

const campusInfo: Ref<StudentCampusData> = ref({
  name: '',
  department: '',
  career: '',
})

const campusesData: Ref<InstituteCampusInformation[]> = ref([])

onMounted(async () => {
  const instituteId = authStore.user?.institute || '507f1f77bcf86cd799439012'

  const response = await nuxtApp.$axios.get<IInstitute>(
    `/institute/${instituteId}`,
  )

  if (response.status === 200) {
    campusesData.value = response.data.campuses
  }

  if (instituteId === '507f1f77bcf86cd799439012') {
    nuxtApp.$router.push('/user/dashboard')
  }
})

async function submitCampusInfo() {
  authStore.refreshAuth()
  const response = await userStore.updateUserStudentData(authStore.user._id, {
    campusInformation: campusInfo.value,
  })
  if (!response.passed) return
  nuxtApp.$router.push('/user/dashboard')
}
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <v-card class="pa-5 rounded-xxl" outlined elevation="5">
          <v-card-title class="text-center mb-2">
            Información del Campus
          </v-card-title>
          <v-form @submit.prevent="submitCampusInfo">
            <v-container>
              <v-row no-gutters>
                <v-col cols="12" md="8" offset-md="2" class="mb-md-2">
                  <v-select
                    label="Campus"
                    v-model="campusInfo.name"
                    :items="campusesData.map((campus) => campus.name)"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    :rules="[required]"
                  />
                </v-col>
                <v-col cols="12" md="8" offset-md="2" class="mb-md-2">
                  <v-select
                    label="Departamento"
                    v-model="campusInfo.department"
                    :items="
                      campusesData
                        .find((campus) => campus.name === campusInfo.name)
                        ?.departments.map((department) => department.name) || []
                    "
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    :rules="[required]"
                  />
                </v-col>
                <v-col cols="12" md="8" offset-md="2" class="mb-md-2">
                  <v-select
                    label="Carrera"
                    v-model="campusInfo.career"
                    :items="
                      campusesData
                        .find((campus) => campus.name === campusInfo.name)
                        ?.departments.find(
                          (department) =>
                            department.name === campusInfo.department,
                        )?.careers || []
                    "
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    :rules="[required]"
                  />
                </v-col>

                <v-col cols="12" class="text-center mt-4">
                  <v-btn
                    type="submit"
                    color="primary"
                    class="rounded-xxl"
                    elevation="2"
                  >
                    Guardar Información
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
