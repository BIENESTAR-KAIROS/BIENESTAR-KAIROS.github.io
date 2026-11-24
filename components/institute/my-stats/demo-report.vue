<script setup lang="ts">
import { publicationMetricLabel } from '~/utils/helpers/statistics-publication'
import type { InstitutionDemoReport } from '~/interfaces/stats/institution-demo.interface'
import type {
  PublicationLabels,
  PublicationMetric,
} from '~/interfaces/stats/statistics-publication.interface'
import PublicationMetricCard from './publication-metric.vue'
import PublicationCharts from './publication-charts.vue'
import { formatPeriodInstant } from '~/utils/helpers/statistics-period-time'
const props = defineProps<{
  report: InstitutionDemoReport
  labels: PublicationLabels
  title: string
}>()
const name = (m: PublicationMetric, index: number) =>
  publicationMetricLabel(m, index, props.labels)
</script>
<template>
  <section class="demo-report" aria-label="Informe demo institucional">
    <header class="panel">
      <span class="badge">Demo · Datos sintéticos</span>
      <h2>{{ title }}</h2>
      <p>
        {{ report.participants.toLocaleString('es-MX') }} participantes demo ·
        Revisión {{ report.definitionRevision }} · Configuración
        {{ report.configurationVersion }}
      </p>
      <p>
        Consultado el
        {{ formatPeriodInstant(report.calculatedAt, 'America/Mexico_City') }} ·
        America/Mexico_City.
      </p>
      <p>
        Estos resultados son ejemplos generados. No representan respuestas de
        personas reales ni un período de evaluación. Se muestra una sola
        generación completa.
      </p>
      <p v-if="report.metrics.some((m) => !m.label && !labels.metrics[m.id])">
        Faltan nombres para algunos resultados de esta revisión.
      </p>
    </header>
    <PublicationCharts
      :items="
        report.metrics.map((metric, index) => ({
          metric,
          label: name(metric, index),
        }))
      "
    />
    <h2>Resultado general y dimensiones</h2>
    <p v-if="!report.metrics.some((m) => m.kind === 'overall')">
      Esta revisión no define una puntuación general. Se muestran sus
      dimensiones disponibles.
    </p>
    <p v-if="!report.metrics.length">
      No hay dimensiones puntuadas en esta revisión.
    </p>
    <div class="metrics-grid">
      <PublicationMetricCard
        v-for="(metric, index) in report.metrics"
        :key="metric.id"
        :metric="metric"
        :label="name(metric, index)"
      />
    </div>
    <details v-if="report.questions.length" class="panel">
      <summary>
        Ver resultados por pregunta ({{ report.questions.length }})
      </summary>
      <PublicationCharts
        questions
        :items="
          report.questions.map((metric, index) => ({
            metric,
            label: name(metric, index),
          }))
        "
      />
      <div class="metrics-grid">
        <PublicationMetricCard
          v-for="(metric, index) in report.questions"
          :key="metric.id"
          :metric="metric"
          :label="name(metric, index)"
        />
      </div>
    </details>
  </section>
</template>
<style scoped>
.demo-report {
  display: grid;
  gap: 20px;
  min-width: 0;
}
.panel {
  padding: 24px;
  background: #fff;
  border: 1px solid #efebf5;
  border-radius: 20px;
  min-width: 0;
}
h2 {
  font-size: 19px;
  font-weight: 800;
  overflow-wrap: anywhere;
}
p {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.6;
}
.badge {
  display: inline-block;
  padding: 6px 12px;
  margin-bottom: 12px;
  background: #f0eaf5;
  color: #5c4a75;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
summary {
  cursor: pointer;
  font-weight: 700;
  margin-bottom: 16px;
}
summary:focus-visible {
  outline: 3px solid #5c4a75;
  outline-offset: 4px;
}
@media (max-width: 700px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  .panel {
    padding: 20px;
  }
}
</style>
