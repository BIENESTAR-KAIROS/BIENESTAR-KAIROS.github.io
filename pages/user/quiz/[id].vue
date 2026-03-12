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
  <Quiz v-else />
</template>
