<script setup lang="ts">
import Quiz from '~/components/user/quiz/quiz.vue'
import { useAuthStore } from '~/store/auth'
import { useUserStore } from '~/store/user'

const { $router } = useNuxtApp()
const route = useRoute()
const isLoading = ref(true)
const authStore = useAuthStore()
const userStore = useUserStore()

const validateQueue = () => {
  const thisQuizId = route.params.id as string
  const thisQuiz = userStore.user.questionnaireQueue.queue.find(
    (item) => item.questionnaireId === thisQuizId,
  )

  if (thisQuiz && thisQuiz.solved) {
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

// TODO: Implement queue order validation logic here
onMounted(async () => {
  try {
    if (userStore.user?.questionnaireQueue) {
      validateQueue()
    } else {
      userStore.user = authStore.user
      await userStore.getUserQuestionnaireQueue()
      validateQueue()
    }
  } catch (error) {
    console.error('Error validating queue order on quiz route:', error)
    await $router.replace('/user/dashboard')
  } finally {
    isLoading.value = false
  }
})

definePageMeta({
  layout: 'empty-login',
})
</script>

<template>
  <div v-if="isLoading" class="quiz-loading">
    <span class="quiz-loading__spinner" />
    <span>Preparando tu cuestionario…</span>
  </div>
  <Quiz v-else />
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
