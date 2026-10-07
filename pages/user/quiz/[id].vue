<script setup lang="ts">
import Quiz from '~/components/user/quiz/quiz.vue'
import DefinitionQuiz from '~/components/user/quiz/definition-quiz.vue'
import QuestionnaireFlowState from '~/components/user/quiz/questionnaire-flow-state.vue'
import type { StudentQuestionnaireItem } from '~/interfaces/quizzes/student-questionnaire-flow.interface'
import { resolveStudentQuestionnaireRoute } from '~/utils/helpers/student-questionnaire-flow'
import { useUserStore } from '~/store/user'
const route = useRoute()
const userStore = useUserStore()
const isLoading = ref(true)
const error = ref(false)
const questionnaire = ref<StudentQuestionnaireItem | null>(null)
async function load() {
  isLoading.value = true
  error.value = false
  questionnaire.value = null
  try {
    const flow = await userStore.loadQuestionnaireFlow()
    const result = resolveStudentQuestionnaireRoute(
      flow,
      String(route.params.id),
    )
    if (result.redirectTo) {
      await navigateTo(result.redirectTo, { replace: true })
      return
    }
    questionnaire.value = result.questionnaire
  } catch {
    error.value = true
  } finally {
    isLoading.value = false
  }
}
onMounted(load)
definePageMeta({ layout: 'empty-login', key: (route) => route.path })
</script>
<template>
  <QuestionnaireFlowState
    v-if="isLoading"
    loading
    message="Preparando tu cuestionario…"
  />
  <QuestionnaireFlowState
    v-else-if="error"
    error
    message="No pudimos consultar tu secuencia. Vuelve a intentarlo."
    @retry="load"
  />
  <DefinitionQuiz
    v-else-if="questionnaire?.schemaVersion === 2 && questionnaire.canPreview"
  />
  <Quiz
    v-else-if="questionnaire?.canRespond && questionnaire.schemaVersion !== 2"
  />
  <QuestionnaireFlowState
    v-else
    :title="questionnaire?.title || 'Cuestionario no disponible'"
    message="Este cuestionario aún no está disponible para responder. Puedes volver al inicio."
  />
</template>
