<script setup lang="ts">
import Quiz from '~/components/user/quiz/quiz.vue'
import { useQuestionnaireQueue } from '~/composables/useQuestionnaireQueue'

const { $router } = useNuxtApp()
const route = useRoute()
const { resolveNextQuestionnaire, getQuestionnaireRoute } =
  useQuestionnaireQueue()
const isCheckingQueue = ref(true)

onMounted(async () => {
  try {
    const { nextQuestionnaireId } = await resolveNextQuestionnaire()

    if (!nextQuestionnaireId) {
      await $router.replace('/user/dashboard')
      return
    }

    if (nextQuestionnaireId !== route.params.id) {
      await $router.replace(getQuestionnaireRoute(nextQuestionnaireId))
      return
    }
  } catch (error) {
    console.error('Error validating queue order on quiz route:', error)
    await $router.replace('/user/dashboard')
  } finally {
    isCheckingQueue.value = false
  }
})

definePageMeta({
  layout: 'empty-login',
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
  <Quiz v-else />
</template>
