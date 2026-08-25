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
  <div v-if="isLoading" class="quiz-loading">
    <span class="quiz-loading__spinner" />
    <span>Buscando tus cuestionarios…</span>
  </div>
  <PosibleQuizzes v-else />
</template>

<style scoped>
.quiz-loading {
  font-family: 'Figtree', sans-serif;
  background: #f4f8f9;
  min-height: 100vh;
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  color: #5c7078;
}

.quiz-loading__spinner {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 3px solid #dbf2f4;
  border-top-color: #07979f;
  animation: quiz-loading-spin 0.8s linear infinite;
}

@keyframes quiz-loading-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
