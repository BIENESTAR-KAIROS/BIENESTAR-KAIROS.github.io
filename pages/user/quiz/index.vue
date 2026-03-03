<script setup lang="ts">
import PosibleQuizzes from '~/components/user/quiz/posible-quizzes.vue'

const { $router } = useNuxtApp()
const { resolveNextQuestionnaire, getQuestionnaireRoute } =
  useQuestionnaireQueue()

const isResolvingQueue = ref(true)

onMounted(async () => {
  try {
    const { nextQuestionnaireId } = await resolveNextQuestionnaire()

    if (nextQuestionnaireId) {
      await $router.replace(getQuestionnaireRoute(nextQuestionnaireId))
      return
    }
  } catch (error) {
    console.error('Error resolving questionnaire queue on index:', error)
  } finally {
    isResolvingQueue.value = false
  }
})
</script>
<template>
  <main>
    <v-container v-if="isResolvingQueue">
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
