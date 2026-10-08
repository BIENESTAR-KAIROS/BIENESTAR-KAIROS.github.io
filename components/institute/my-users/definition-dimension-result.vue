<script setup lang="ts">
import type { DimensionResult } from '~/interfaces/quizzes/definition-result.interface'
defineProps<{ dimension: DimensionResult }>()
</script>

<template>
  <div>
    <p>
      <span v-if="dimension.group">{{ dimension.group }} · </span>
      {{ dimension.label }}:
      {{
        dimension.score ??
        (dimension.status === 'no_visible_questions'
          ? 'No aplica'
          : 'Sin puntaje evaluable')
      }}
      <span v-if="dimension.score !== null && dimension.unit">{{
        dimension.unit
      }}</span>
      <span v-if="dimension.interpretation">
        · {{ dimension.interpretation }}</span
      >
    </p>
    <details v-if="dimension.recommendations">
      <summary>Recomendaciones de este nivel</summary>
      <p>{{ dimension.recommendations }}</p>
    </details>
  </div>
</template>
