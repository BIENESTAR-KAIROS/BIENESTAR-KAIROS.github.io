<script setup lang="ts">
definePageMeta({
  prerender: false,
  layout: 'empty-login',
})

import FinishQuiz from '~/components/user/quiz/finish-quiz.vue'
</script>

<template>
  <main>
    <FinishQuiz />
  </main>
</template>
