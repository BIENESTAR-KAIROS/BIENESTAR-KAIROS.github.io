<script setup lang="ts">
import {
  type IQuizAvaibleResponse,
  type IQuizzesAvaibleResponse,
} from '~/interfaces/quizzes/quiz-preview.interface'
import { useAuthStore } from '~/store/auth'

const posibleQuizzes: Ref<IQuizzesAvaibleResponse> = ref({
  questionnaires: [] as IQuizAvaibleResponse[],
  count: 0,
})
const { $axios } = useNuxtApp()
const isLoading = ref(true)

const authStore = useAuthStore()

onMounted(async () => {
  try {
    isLoading.value = true
    const { data } = await $axios.get<IQuizzesAvaibleResponse>(
      `/questionnaires/available/${authStore.user?._id}`,
    )
    posibleQuizzes.value = data
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <v-container>
    <v-row v-show="isLoading">
      <v-col cols="12">
        <v-progress-circular
          color="primary"
          indeterminate
        ></v-progress-circular>
      </v-col>
    </v-row>
    <v-row v-show="!isLoading">
      <v-col cols="12">
        <div class="my-4">
          <h1 class="handlee-regular text-h3 font-weight-thin">
            Responder el cuestionario
          </h1>
        </div>
      </v-col>
      <v-col cols="12">
        <div class="my-3">
          <span class="catamaran-regular text-subtitle-1">
            Actualmente tu organización cuenta con
            {{ posibleQuizzes.count }} cuestionarios disponibles, puedes
            responder aquel que creas que puede ayudarnos a dar mejores
            recomendaciones dependiendo de tu estado de ánimo.
          </span>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="(posibleQuizz, i) in posibleQuizzes.questionnaires"
        :key="i"
        cols="12"
        md="6"
        lg="4"
        xl="3"
      >
        <v-sheet
          rounded="lg"
          height="500"
          class="px-4 py-2 pt-5 d-flex flex-column justify-space-around align-center text-center"
          :elevation="5"
        >
          <span class="text-h5 catamaran-regular">{{
            posibleQuizz.title
          }}</span>
          <span class="text-body-1 catamaran-regular">{{
            posibleQuizz.description
          }}</span>
          <NuxtLink
            :href="'/user/quiz/' + posibleQuizz.id"
            class="text-decoration-none"
          >
            <v-btn
              class="text-body-1 catamaran-regular bg-secondary"
              rounded="lg"
            >
              Responder el cuestionario
            </v-btn>
          </NuxtLink>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
