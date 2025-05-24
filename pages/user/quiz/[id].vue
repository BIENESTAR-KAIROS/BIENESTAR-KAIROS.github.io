<script setup lang="ts">
import Quiz from '~/components/user/quiz/quiz.vue';

definePageMeta({
  layout: "empty-login",
});
const route = useRoute()
// The quiz number is {{ route.params.id }}

</script>

<template>
  <Quiz />
</template>
