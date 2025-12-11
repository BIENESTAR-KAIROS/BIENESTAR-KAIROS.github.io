<script setup>
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

const postalCode = ref(null)
const civilStatus = ref(null)
const studyYear = ref(null)
const housingSituation = ref(null)
const personalMonthlyIncome = ref(null)
const familyMonthlyIncome = ref(null)
const employmentStatus = ref(null)
const healthChronicDiseaseTemp = ref(null)
const tabacoUseTemp = ref(null)
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

const demographicForm = computed({
  get: () => {
    return (
      postalCode.value &&
      civilStatus.value &&
      studyYear.value &&
      housingSituation.value &&
      personalMonthlyIncome.value &&
      familyMonthlyIncome.value &&
      employmentStatus.value &&
      healthChronicDisease.value &&
      tabacoUse.value &&
      alcoholCompsumptionFrequency.value &&
      physicalActivityFrequency.value
    )
  },
  set: (value) => {
    console.log(value)
  },
})
</script>

<template>
  <v-container>
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
                <v-col cols="12" md="6" offset-md="3">
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
                <v-col cols="12" md="6" offset-md="3">
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
                <v-col cols="12" md="6" offset-md="3">
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
                    :disabled="!demographicForm"
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
  <v-footer class="text-center bg-secondary pa-4">
    <NuxtLink
      href="/user/privacy-policy"
      class="w-100 text-subtitle-1 catamaran-regular text-white"
    >
      Aviso de privacidad
    </NuxtLink>
  </v-footer>
</template>
