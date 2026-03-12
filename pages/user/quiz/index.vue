<script setup lang="ts">
import PosibleQuizzes from '~/components/user/quiz/posible-quizzes.vue'
import type { IUserQuestionnaireQueue } from '~/interfaces/user/user.interface'
import { useAuthStore } from '~/store/auth'
import { useUserStore } from '~/store/user'

const { $router } = useNuxtApp()

const authStore = useAuthStore()
const userStore = useUserStore()

const isLoading = ref(true)

const redirectToQueue = (quizId: string) => {
  $router.push(`/user/quiz/${quizId}`)
}

// TODO validate if the user has a questionnaire in the queue or need to start a queue, if so, redirect to it
onMounted(async () => {
  try {
    userStore.user = authStore.user

    const queue = await userStore.getUserQuestionnaireQueue()

    if (queue && queue.queue.length > 0) {
      const nextQuiz = queue.queue[0]
      redirectToQueue(nextQuiz.questionnaireId)
    }
  } catch (error) {
    console.error('Error resolving questionnaire queue on index:', error)
  } finally {
    isLoading.value = false
  }
})
</script>
<template>
  <main>
    <v-container v-if="isLoading">
      <v-row>
        <v-col cols="12" class="d-flex justify-center">
          <v-progress-circular
            color="primary"
            indeterminate
          ></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>
    <PosibleQuizzes v-else />
  </main>
</template>
