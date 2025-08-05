<script setup lang="ts">
import type { IRecomendations } from '~/interfaces/recomendations/recomendations.interface'
import { useQuizStore, type IQuizResponse } from '~/store/quiz'

const { $axios } = useNuxtApp()
const quizStore = useQuizStore()

const sum = ref(0)
const calification = computed(() => {
  sum.value = 0
  const suma = (question: IQuizResponse): Number => {
    const temp = ref(0)

    temp.value += Number(question.answer) < 0 ? 0 : Number(question.answer)
    question.options.forEach((option) => {
      option.subquestions?.forEach((sub) => {
        temp.value += Number(suma(sub))
      })
    })

    return Number(temp.value)
  }

  quizStore.quiz.forEach((question) => {
    sum.value += Number(suma(question))
  })

  return Number(sum.value)
})
console.log(calification.value)

const isLoading = ref(false)
const recomendations = ref([] as IRecomendations[])

const claves = ref<Record<string, string>>({
  '6865871136aa0b3c141cf766': 'PHQ',
  '687f24aa1c222766e367ff24': 'GAD',
  '687f3d331c222766e367ff26': 'ASST',
})

onMounted(async () => {
  var category = claves.value[quizStore.quiz[0].questionnaireId]
  if (category == 'PHQ') {
    if (sum.value < 5) {
      category += '0001'
    } else if (sum.value < 10) {
      category += '0002'
    } else if (sum.value < 15) {
      category += '0003'
    } else {
      category += '0004'
    }
  } else if (category == 'GAD') {
    if (sum.value < 5) {
      category += '0001'
    } else if (sum.value < 10) {
      category += '0002'
    } else if (sum.value < 15) {
      category += '0003'
    } else {
      category += '0004'
    }
  } else if (category == 'ASST') {
    if (sum.value < 35) {
      category += '0004'
    } else if (sum.value < 270) {
      category += '0005'
    } else {
      category += '0006'
    }
  }
  try {
    isLoading.value = true
    if (quizStore.quiz[0].questionnaireId != '687eb71ad314bf6498877687') {
      const { data } = await $axios.get<IRecomendations>(
        `/recommendations/${category}`,
      )
      recomendations.value.push(data)
    }
    for (let index = 0; index < 3; index++) {
      const { data } = await $axios.get<IRecomendations>(
        `/recommendations/random`,
      )
      recomendations.value.push(data)
    }
  } catch (error) {
    console.log(error)
    alert('Error al obtener tus recomendaciones.')
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
    <v-row class="h-md-screen">
      <v-col cols="12" md="3" class="h-100">
        <div class="d-block d-md-none">
          <v-img src="/image-result-quiz.png" height="200" />
        </div>
        <div class="d-none d-md-flex h-100 flex-column pa-4">
          <v-img src="/image-result-quiz.png" height="300" />
        </div>
      </v-col>
      <v-col cols="12" md="" class="h-100">
        <div class="d-flex h-100 flex-column justify-center pa-5">
          <v-card
            elevation="5"
            color="secondary"
            class="px-6 pt-6 d-flex flex-column align-center overflow-auto"
          >
            <v-card-title class="handlee-regular text-h2 font-weight-bold">
              Tus recomendaciones:
            </v-card-title>
            <div
              v-if="
                quizStore.quiz[0].questionnaireId != '687eb71ad314bf6498877687'
              "
              class="w-50 h-50 d-flex justify-space-around align-center mb-6"
            >
              <h2 class="handlee-regular text-h4 font-weight-regular">
                Puntaje:
              </h2>
              <span class="handlee-regular text-h4 font-weight-bold">
                {{ calification }}
              </span>
            </div>
            <v-row>
              <v-col
                v-for="(recomendation, i) in recomendations"
                :key="i"
                cols="12"
                md="3"
              >
                <v-sheet
                  rounded="xl"
                  class="px-4 py-4 pt-5 d-flex flex-column justify-space-around align-center text-center h-100"
                  :elevation="5"
                >
                  <div class="mb-9">
                    <span class="text-body-1 catamaran-regular">
                      {{ recomendation.recommendation }}
                    </span>
                  </div>
                  <span class="text-body-1 catamaran-regular">
                    <span
                      class="text-body-1 catamaran-regular font-weight-bold"
                    >
                      Categoría:
                    </span>
                    {{ recomendation.category }}
                  </span>
                </v-sheet>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <div
                  class="w-100 h-50 d-flex justify-space-around align-center mb-6"
                >
                  <span class="handlee-regular text-h4 font-weight-bold">
                    Recomendación especial:
                  </span>
                  <h2 class="handlee-regular font-weight-regular">
                    Recuerda que puedes acercarte a la Unidad de Psicología
                    Clínica de la UP para que te orienten sobre tu bienestar.
                  </h2>
                </div>
              </v-col>
            </v-row>
            <v-card-actions class="mt-3">
              <NuxtLink href="/user/dashboard" class="h-100">
                <v-btn
                  class="bg-greenShadow text-subtitle-1 catamaran-regular font-weight-bold"
                >
                  Volver al inicio
                </v-btn>
              </NuxtLink>
            </v-card-actions>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </div>
</template>
