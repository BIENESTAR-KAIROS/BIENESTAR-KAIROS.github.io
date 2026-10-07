<script setup lang="ts">
import PosibleQuizzes from '~/components/user/quiz/posible-quizzes.vue'
import QuestionnaireFlowState from '~/components/user/quiz/questionnaire-flow-state.vue'
import type { StudentQuestionnaireFlow } from '~/interfaces/quizzes/student-questionnaire-flow.interface'
import { useUserStore } from '~/store/user'
const userStore = useUserStore()
const isLoading = ref(true)
const error = ref(false)
const flow = ref<StudentQuestionnaireFlow | null>(null)
async function load() {
  isLoading.value = true
  error.value = false
  try {
    flow.value = await userStore.loadQuestionnaireFlow()
    if (flow.value.isActive && flow.value.nextQuestionnaireId) {
      await navigateTo(`/user/quiz/${flow.value.nextQuestionnaireId}`, {
        replace: true,
      })
      return
    }
  } catch {
    error.value = true
  } finally {
    isLoading.value = false
  }
}
onMounted(load)
</script>
<template>
  <QuestionnaireFlowState
    v-if="isLoading"
    loading
    message="Buscando tus cuestionarios…"
  />
  <QuestionnaireFlowState
    v-else-if="error"
    error
    message="No pudimos consultar tus cuestionarios. Vuelve a intentarlo."
    @retry="load"
  />
  <PosibleQuizzes
    v-else-if="flow"
    :questionnaires="flow.questionnaires"
    :sequence-complete="flow.isActive"
  />
</template>
