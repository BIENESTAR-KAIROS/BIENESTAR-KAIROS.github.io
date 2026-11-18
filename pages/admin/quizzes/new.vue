<script setup lang="ts">
import AddQuizComp from '~/components/institute/my-quizzes/add-quiz-comp.vue'

definePageMeta({
  layout: 'admin',
})
</script>

<template>
  <main>
    <AddQuizComp global />
  </main>
</template>
