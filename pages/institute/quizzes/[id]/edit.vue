<script setup lang="ts">
import AddQuizComp from '~/components/institute/my-quizzes/add-quiz-comp.vue'
const route = useRoute()
definePageMeta({ layout: 'institute' })
</script>
<template>
  <main>
    <AddQuizComp
      :key="String(route.params.id)"
      :questionnaire-id="String(route.params.id)"
    />
  </main>
</template>
