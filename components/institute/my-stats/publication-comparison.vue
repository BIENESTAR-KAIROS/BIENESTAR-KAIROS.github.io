<script setup lang="ts">
import { ref, watch } from 'vue'
import type {
  PublicationLabels,
  StatisticsPublication,
} from '~/interfaces/stats/statistics-publication.interface'
import { publicationMetricLabel } from '~/utils/helpers/statistics-publication'
import ComparisonResults from './comparison-results.vue'

const props = defineProps<{
  report: StatisticsPublication
  labels: PublicationLabels
}>()
const metricId = ref('')
const questionId = ref('')
const comparisons = computed(() => props.report.comparisons ?? [])
const metrics = computed(() =>
  props.report.metrics.flatMap((m, i) =>
    comparisons.value.some((c) => c.metricId === m.id)
      ? [{ id: m.id, label: publicationMetricLabel(m, i, props.labels) }]
      : [],
  ),
)
const questions = computed(() =>
  comparisons.value.filter((c) => c.metricId === metricId.value),
)
const selected = computed(() =>
  questions.value.find((c) => c.questionId === questionId.value),
)
watch(
  metrics,
  (items) => {
    metricId.value =
      items.find((m) => m.id === metricId.value)?.id ?? items[0]?.id ?? ''
  },
  { immediate: true },
)
watch(
  questions,
  (items) => {
    questionId.value =
      items.find((q) => q.questionId === questionId.value)?.questionId ??
      items[0]?.questionId ??
      ''
  },
  { immediate: true },
)
</script>
<template>
  <section class="real-comparison" aria-labelledby="real-comparison-title">
    <h2 id="real-comparison-title">Comparar con el Sociodemográfico</h2>
    <template v-if="metrics.length">
      <p>
        Se usa la respuesta vigente al cierre del período. Elige un resultado y
        una pregunta para ver su comparación publicada.
      </p>
      <div class="filters">
        <label
          >Resultado del cuestionario<select v-model="metricId">
            <option v-for="m in metrics" :key="m.id" :value="m.id">
              {{ m.label }}
            </option>
          </select></label
        >
        <label
          >Pregunta del Sociodemográfico<select v-model="questionId">
            <option
              v-for="q in questions"
              :key="q.questionId"
              :value="q.questionId"
            >
              {{ q.text }}
            </option>
          </select></label
        >
      </div>
      <ComparisonResults
        v-if="selected"
        :result="selected"
        :kind="selected.kind"
        :question="selected.text"
        :metric-label="metrics.find((m) => m.id === metricId)?.label ?? ''"
        :participants="report.participants"
      />
    </template>
    <p v-else>
      Este informe no contiene cruces publicados con el Sociodemográfico.
    </p>
  </section>
</template>
<style scoped>
.real-comparison {
  --ink: #3c2f52;
  color: var(--ink);
  background: white;
  border: 1px solid #e5dfee;
  border-radius: 20px;
  padding: clamp(16px, 3vw, 24px);
  display: grid;
  gap: 16px;
  min-width: 0;
}
h2 {
  font-size: 18px;
}
.filters {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
label {
  display: grid;
  flex: 1 1 250px;
  min-width: 0;
  gap: 6px;
  font-weight: 700;
}
select {
  width: 100%;
  min-width: 0;
  font: inherit;
  min-height: 44px;
  border: 1px solid currentColor;
  border-radius: 10px;
  padding: 8px 12px;
  background: white;
}
select:focus-visible {
  outline: 3px solid var(--ink);
  outline-offset: 3px;
}
</style>
