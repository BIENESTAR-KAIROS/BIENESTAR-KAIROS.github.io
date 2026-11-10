<script setup lang="ts">
import PublicationStats from '~/components/institute/my-stats/publication-stats.vue'
import DemoStats from '~/components/institute/my-stats/demo-stats.vue'
const population = ref<'real' | 'demo'>('real')
definePageMeta({ layout: 'institute' })
</script>

<template>
  <main>
    <div
      class="population-selector"
      role="group"
      aria-label="Población del informe"
    >
      <button
        type="button"
        :aria-pressed="population === 'real'"
        @click="population = 'real'"
      >
        Alumnos reales
      </button>
      <button
        type="button"
        :aria-pressed="population === 'demo'"
        @click="population = 'demo'"
      >
        Datos demo
      </button>
    </div>
    <PublicationStats v-if="population === 'real'" />
    <DemoStats v-else />
  </main>
</template>
<style scoped>
.population-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 24px 32px 0;
  font-family: 'Figtree', sans-serif;
}
button {
  min-height: 44px;
  padding: 10px 20px;
  border: 2px solid #ded6ea;
  border-radius: 999px;
  background: #fff;
  color: #3c2f52;
  font-size: 14px;
  font-weight: 700;
}
button[aria-pressed='true'] {
  background: #3c2f52;
  border-color: #3c2f52;
  color: #fff;
}
button:focus-visible {
  outline: 3px solid #5c4a75;
  outline-offset: 3px;
}
@media (max-width: 700px) {
  .population-selector {
    padding: 20px 16px 0;
  }
}
</style>
