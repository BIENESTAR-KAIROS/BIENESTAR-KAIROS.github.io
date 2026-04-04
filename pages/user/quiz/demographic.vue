<script setup>
import { useDisplay } from 'vuetify'
import { required } from '~/utils/helpers/form-rules'
import {
  civilStatusTranslations,
  studyYearTranslations,
  housingSituationTranslations,
  personalMonthlyIncomeTranslations,
  familyMonthlyIncomeTranslations,
  employmentStatusTranslations,
  consumptionFrecuencyTranslations,
  physicalActivityTranslations,
} from '~/utils/constants/translations'
import { useUserStore } from '~/store/user'
import { useAuthStore } from '~/store/auth'

const { $router } = useNuxtApp()
const { mobile } = useDisplay()

const userStore = useUserStore()
const authStore = useAuthStore()
const isCheckingQueue = ref(true)

const userInstituteId = computed(() => {
  return authStore.user?.instituteId
})
const isBlockedForThisUser = computed(() => {
  return authStore.isBlockedForInstitutes.includes(userInstituteId.value)
})

const postalCode = ref(null)
const civilStatus = ref(null)
const studyYear = ref(null)
const housingSituation = ref(null)
const personalMonthlyIncome = ref(null)
const familyMonthlyIncome = ref(null)
const employmentStatus = ref(null)
const healthChronicDiseaseTemp = ref(null)
const tabacoUseTemp = ref(null)
const nicotineProductUseTemp = ref(null)
const alcoholCompsumptionFrequency = ref(null)
const physicalActivityFrequency = ref(null)

const healthChronicDisease = computed(() => {
  if (healthChronicDiseaseTemp.value === 'Sí') {
    return true
  } else if (healthChronicDiseaseTemp.value === 'No') {
    return false
  } else {
    return null
  }
})
const tabacoUse = computed(() => {
  if (tabacoUseTemp.value === 'Sí') {
    return true
  } else if (tabacoUseTemp.value === 'No') {
    return false
  } else {
    return null
  }
})
const nicotineProductUse = computed(() => {
  if (nicotineProductUseTemp.value === 'Sí') {
    return true
  } else if (nicotineProductUseTemp.value === 'No') {
    return false
  } else {
    return null
  }
})
const isValidForm = ref(false)
const demographicForm = computed({
  get: () => {
    return
    postalCode.value &&
      civilStatus.value &&
      studyYear.value &&
      housingSituation.value &&
      personalMonthlyIncome.value &&
      familyMonthlyIncome.value &&
      employmentStatus.value &&
      healthChronicDisease.value &&
      tabacoUse.value &&
      nicotineProductUse.value &&
      alcoholCompsumptionFrequency.value &&
      physicalActivityFrequency.value
  },
  set: (value) => {
    isValidForm.value = value
  },
})

const saveAnswers = async () => {
  try {
    await authStore.refreshAuth()
    const response = await userStore.updateUserStudentData(authStore.user._id, {
      demographicData: {
        postalCode: postalCode.value,
        civilStatus: civilStatusTranslations[civilStatus.value],
        studyYear: studyYearTranslations[studyYear.value],
        housingSituation: housingSituationTranslations[housingSituation.value],
        personalMonthlyIncome:
          personalMonthlyIncomeTranslations[personalMonthlyIncome.value],
        familyMonthlyIncome:
          familyMonthlyIncomeTranslations[familyMonthlyIncome.value],
        employmentStatus: employmentStatusTranslations[employmentStatus.value],
        healthChronicDisease: healthChronicDisease.value,
        tabacoUse: tabacoUse.value,
        alcoholCompsumptionFrequency:
          consumptionFrecuencyTranslations[alcoholCompsumptionFrequency.value],
        physicalActivityFrequency:
          physicalActivityTranslations[physicalActivityFrequency.value],
        nicotineProductUse: nicotineProductUse.value,
      },
    })
    if (response.passed) {
      if (authStore.user?.studentData) {
        authStore.user.studentData.demographicSurveyCompleted = true
      }

      if (userStore.user.questionnaireQueue) {
        userStore.user.questionnaireQueue = {
          queue: userStore.user.questionnaireQueue.queue.map((item) =>
            item.questionnaireId === 'demographic'
              ? { ...item, solved: true }
              : item,
          ),
        }

        const nextQuiz = userStore.user.questionnaireQueue.queue.find(
          (item) => !item.solved,
        )

        if (nextQuiz) {
          await $router.push(`/user/quiz/${nextQuiz.questionnaireId}`)
          return
        }
      }

      await $router.push('/user/dashboard')
    } else alert('error saving')
  } catch (error) {
    console.error('Error saving demographic answers:', error)
  }
}

const validateQueue = () => {
  const demographicQuiz = userStore.user.questionnaireQueue.queue.find(
    (item) => item.questionnaireId === 'demographic',
  )

  if (demographicQuiz && demographicQuiz.solved) {
    const nextQuiz = userStore.user.questionnaireQueue.queue.find(
      (item) => !item.solved,
    )

    if (nextQuiz) {
      $router.push(`/user/quiz/${nextQuiz.questionnaireId}`)
    } else {
      $router.push('/user/dashboard')
    }
  }
}

onMounted(async () => {
  try {
    if (userStore.user) {
      if (userStore.user.questionnaireQueue) {
        validateQueue()
      } else {
        await userStore.getUserQuestionnaireQueue()
        validateQueue()
      }
    } else {
      userStore.user = authStore.user
      await userStore.getUserQuestionnaireQueue()
      validateQueue()
    }
  } catch (error) {
    console.error('Error validating demographic queue:', error)
  } finally {
    isCheckingQueue.value = false
  }
})
</script>

<template>
  <v-container v-if="isCheckingQueue">
    <v-row>
      <v-col cols="12" class="d-flex justify-center">
        <v-progress-circular
          color="primary"
          indeterminate
        ></v-progress-circular>
      </v-col>
    </v-row>
  </v-container>

  <v-container v-else>
    <v-row no-gutters>
      <v-col>
        <v-card>
          <v-card-title class="handlee-regular text-h5">
            Cuestionario sociodemográfico
          </v-card-title>
          <div class="catamaran-regular text-body-1 py-2 text-center">
            Llena el siguiente cuestionario para completar tu registro
          </div>
          <div class="catamaran-regular text-body-2 font-weight-thin py-2 px-4">
            ❤️ Recuerda, esta información se recopila únicamente para entender
            mejor los datos demográficos de tu muestra y ayudarte a entender
            mejor tus emociones.
          </div>
          <div
            class="catamaran-regular text-body-2 font-weight-thin py-2 px-4 mb-4"
          >
            ❤️ Ten en mente que todos somos humanos, y es natural cambiar.
            Puedes completar este cuestionario la cantidad de veces que sientas
            que tu situación se ha modificado.
          </div>
          <v-form v-model="demographicForm">
            <v-container>
              <v-row no-gutters>
                <v-col cols="12" md="6" offset-md="3">
                  <div v-show="mobile" class="ms-2">
                    <span class="catamaran-regular text-body-1">
                      Código postal
                    </span>
                  </div>
                  <v-text-field
                    label="Código postal"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    v-model="postalCode"
                    :rules="[required]"
                    validate-on="lazy input"
                    type="number"
                  />
                </v-col>
                <v-col cols="12" md="6" offset-md="3">
                  <div v-show="mobile" class="ms-2">
                    <span class="catamaran-regular text-body-1">
                      ¿Cuál es tu estado civil?
                    </span>
                  </div>
                  <v-select
                    label="¿Cuál es tu estado civil?"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    v-model="civilStatus"
                    :rules="[required]"
                    validate-on="lazy input"
                    :items="Object.keys(civilStatusTranslations) || []"
                  />
                </v-col>
                <v-col
                  v-if="isBlockedForThisUser"
                  cols="12"
                  md="6"
                  offset-md="3"
                >
                  <div v-show="mobile" class="ms-2">
                    <span class="catamaran-regular text-body-1">
                      ¿En qué año de tus estudios te encuentras actualmente?
                    </span>
                  </div>
                  <v-select
                    label="¿En qué año de tus estudios te encuentras actualmente?"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    v-model="studyYear"
                    :rules="[required]"
                    validate-on="lazy input"
                    :items="Object.keys(studyYearTranslations) || []"
                  />
                </v-col>
                <v-col cols="12" md="6" offset-md="3">
                  <div v-show="mobile" class="ms-2">
                    <span class="catamaran-regular text-body-1">
                      ¿En donde vives actualmente?
                    </span>
                  </div>
                  <v-select
                    label="¿En donde vives actualmente?"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    v-model="housingSituation"
                    :rules="[required]"
                    validate-on="lazy input"
                    :items="Object.keys(housingSituationTranslations) || []"
                  />
                </v-col>
                <v-col cols="12" md="6" offset-md="3">
                  <div v-show="mobile" class="ms-2">
                    <span class="catamaran-regular text-body-1">
                      ¿En qué rango están tus ingresos mensuales personales?
                    </span>
                  </div>
                  <v-select
                    label="¿En qué rango están tus ingresos mensuales personales?"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    v-model="personalMonthlyIncome"
                    :rules="[required]"
                    validate-on="lazy input"
                    :items="
                      Object.keys(personalMonthlyIncomeTranslations) || []
                    "
                  />
                </v-col>
                <v-col cols="12" md="6" offset-md="3">
                  <div v-show="mobile" class="ms-2">
                    <span class="catamaran-regular text-body-1">
                      ¿En qué rango están tus ingresos mensuales familiares?
                    </span>
                  </div>
                  <v-select
                    label="¿En qué rango están tus ingresos mensuales familiares?"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    v-model="familyMonthlyIncome"
                    :rules="[required]"
                    validate-on="lazy input"
                    :items="Object.keys(familyMonthlyIncomeTranslations) || []"
                  />
                </v-col>
                <v-col
                  v-if="isBlockedForThisUser"
                  cols="12"
                  md="6"
                  offset-md="3"
                >
                  <div v-show="mobile" class="ms-2">
                    <span class="catamaran-regular text-body-1">
                      ¿Trabajas mientras realizas tus estudios?
                    </span>
                  </div>
                  <v-select
                    label="¿Trabajas mientras realizas tus estudios?"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    v-model="employmentStatus"
                    :rules="[required]"
                    validate-on="lazy input"
                    :items="Object.keys(employmentStatusTranslations) || []"
                  />
                </v-col>
                <v-col cols="12" md="6" offset-md="3">
                  <div v-show="mobile" class="ms-2">
                    <span class="catamaran-regular text-body-1">
                      ¿Padeces de alguna enfermedad crónica?
                    </span>
                  </div>
                  <v-select
                    label="¿Padeces de alguna enfermedad crónica?"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    v-model="healthChronicDiseaseTemp"
                    :rules="[required]"
                    validate-on="lazy input"
                    :items="['Sí', 'No']"
                  />
                </v-col>
                <v-col cols="12" md="6" offset-md="3">
                  <div v-show="mobile" class="ms-2">
                    <span class="catamaran-regular text-body-1">
                      ¿Has usado alguna vez productos de nicotina en bolsa como
                      Velo, Zyn, Snus (que se colocan entre el labio y la encía,
                      sin necesidad de fumar)?
                    </span>
                  </div>
                  <v-select
                    label="¿Has usado alguna vez productos de nicotina en bolsa como Velo, Zyn, Snus (que se colocan entre el labio y la encía, sin necesidad de fumar)?"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    v-model="nicotineProductUseTemp"
                    :rules="[required]"
                    validate-on="lazy input"
                    :items="['Sí', 'No']"
                  />
                </v-col>
                <v-col
                  v-if="isBlockedForThisUser"
                  cols="12"
                  md="6"
                  offset-md="3"
                >
                  <div v-show="mobile" class="ms-2">
                    <span class="catamaran-regular text-body-1">
                      ¿Consumes tabaco?
                    </span>
                  </div>
                  <v-select
                    label="¿Consumes tabaco?"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    v-model="tabacoUseTemp"
                    :rules="[required]"
                    validate-on="lazy input"
                    :items="['Sí', 'No']"
                  />
                </v-col>
                <v-col
                  v-if="isBlockedForThisUser"
                  cols="12"
                  md="6"
                  offset-md="3"
                >
                  <div v-show="mobile" class="ms-2">
                    <span class="catamaran-regular text-body-1">
                      ¿Consumes alcohol?
                    </span>
                  </div>
                  <v-select
                    label="¿Consumes alcohol?"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    v-model="alcoholCompsumptionFrequency"
                    :rules="[required]"
                    validate-on="lazy input"
                    :items="Object.keys(consumptionFrecuencyTranslations) || []"
                  />
                </v-col>
                <v-col cols="12" md="6" offset-md="3">
                  <div v-show="mobile" class="ms-2">
                    <span class="catamaran-regular text-body-1">
                      ¿Cuántas horas a la semana dedicas a hacer alguna
                      actividad física?
                    </span>
                  </div>
                  <v-select
                    label="¿Cuántas horas a la semana dedicas a hacer alguna actividad física?"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    v-model="physicalActivityFrequency"
                    :rules="[required]"
                    validate-on="lazy input"
                    :items="Object.keys(physicalActivityTranslations) || []"
                  />
                </v-col>
                <v-col cols="12" md="6" offset-md="3" class="text-center">
                  <v-btn
                    color="secondary"
                    class="ma-2 handlee-regular text-h2-1"
                    :disabled="!isValidForm"
                    @click="saveAnswers"
                  >
                    Guardar mis respuestas
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <v-footer class="text-center bg-greenShadow pa-4">
    <NuxtLink
      href="/user/privacy-policy"
      class="w-100 text-subtitle-1 catamaran-regular text-white"
    >
      Aviso de privacidad
    </NuxtLink>
  </v-footer>
</template>
