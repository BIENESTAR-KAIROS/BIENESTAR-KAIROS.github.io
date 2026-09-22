<script setup lang="ts">
import FinishQuiz from '~/components/user/quiz/finish-quiz.vue'

definePageMeta({
  prerender: false,
  layout: 'empty-login',
})
</script>

<template>
  <main>
    <FinishQuiz />
  </main>
</template>
