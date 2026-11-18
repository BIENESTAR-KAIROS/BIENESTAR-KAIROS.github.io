<script setup lang="ts">
import StatisticsPeriods from './statistics-periods.vue'
</script>
<template>
  <section class="my-settings" aria-labelledby="settings-title">
    <header class="settings-header">
      <h1 id="settings-title">Mis configuraciones</h1>
    </header>
    <NuxtLink class="settings-action" to="/institute/quizzes/catalog"
      >Cuestionarios disponibles</NuxtLink
    >
    <StatisticsPeriods />
  </section>
</template>

<style scoped>
.my-settings {
  padding: 24px 32px 40px;
  color: #3c2f52;
  font-family: 'Figtree', sans-serif;
  max-width: 1280px;
  margin: 0 auto;
}
.settings-header {
  margin-bottom: 28px;
}
h1 {
  font-size: clamp(24px, 4vw, 30px);
  line-height: 1.25;
}
.settings-action {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: #523f6e;
  margin-bottom: 20px;
}
.settings-action:focus-visible {
  outline: 3px solid #523f6e;
  outline-offset: 3px;
}
@media (max-width: 600px) {
  .my-settings {
    padding: 16px;
  }
}
</style>
