<script setup lang="ts">
import QuestionnaireFlowState from '~/components/user/quiz/questionnaire-flow-state.vue'
definePageMeta({ alias: '/user/quiz/demographic-survey' })
</script>

<template>
  <QuestionnaireFlowState
    title="Cuestionario no disponible"
    message="El cuestionario sociodemográfico está desactivado y ya no admite respuestas."
  />
</template>
