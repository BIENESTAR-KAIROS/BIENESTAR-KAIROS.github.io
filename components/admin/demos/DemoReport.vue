<script setup lang="ts">
import type { DemoReport } from '~/interfaces/stats/demo.interface'
import type {
  PublicationLabels,
  PublicationMetric,
} from '~/interfaces/stats/statistics-publication.interface'
import PublicationMetricCard from '~/components/institute/my-stats/publication-metric.vue'
import PublicationCharts from '~/components/institute/my-stats/publication-charts.vue'
import { demoProfileLabel } from '~/utils/translations/demo'
import { formatPeriodInstant } from '~/utils/helpers/statistics-period-time'
const props = defineProps<{
  report: DemoReport
  labels: PublicationLabels
  title: string
  currentRevision: string
}>()
const sameRevision = computed(
  () => props.report.configuration.definitionRevision === props.currentRevision,
)
const name = (m: PublicationMetric, index: number, question = false) =>
  (sameRevision.value &&
    (question ? props.labels.questions[m.id] : props.labels.metrics[m.id])) ||
  (m.kind === 'overall'
    ? 'Resultado general'
    : `${question ? 'Pregunta' : 'Dimensión'} ${index + 1} · ${m.id}`)
</script>
<template>
  <section class="demo-results" aria-labelledby="demo-report-title">
    <header class="user-panel">
      <span class="user-badge">Demo · Datos sintéticos</span>
      <h2 id="demo-report-title">Resultados de {{ title }}</h2>
      <p>
        {{ report.participants.toLocaleString('es-MX') }} participantes demo ·
        Revisión {{ report.configuration.definitionRevision }} · Configuración
        {{ report.configuration.version }}
      </p>
      <p>
        Consultado el
        {{ formatPeriodInstant(report.calculatedAt, 'America/Mexico_City') }} ·
        America/Mexico_City.
      </p>
      <p>
        Estos resultados corresponden a la generación activa completa. No
        representan respuestas de alumnos reales. Los cambios del formulario se
        reflejarán cuando termine y se active otra generación.
      </p>
      <details>
        <summary>Configuración utilizada en estos resultados</summary>
        <p>
          Distribución base:
          {{ demoProfileLabel(report.configuration.controls.default) }}.
        </p>
        <ul v-if="report.configuration.controls.dimensions.length">
          <li
            v-for="(d, index) in report.configuration.controls.dimensions"
            :key="d.dimensionId"
          >
            {{
              (sameRevision && labels.metrics[d.dimensionId]) ||
              `Dimensión ${index + 1} · ${d.dimensionId}`
            }}: {{ demoProfileLabel(d.profile) }}.
          </li>
        </ul>
        <p v-else>Sin ajustes específicos por dimensión.</p>
      </details>
      <p v-if="!sameRevision" class="user-notice">
        La generación activa usa una revisión anterior. Sus nombres se muestran
        como identificadores para no mezclarlos con la revisión actual.
      </p>
    </header>
    <PublicationCharts
      context="admin"
      :items="
        report.metrics.map((metric, index) => ({
          metric,
          label: name(metric, index),
        }))
      "
    />
    <h3>Resultado general y dimensiones</h3>
    <p v-if="!report.metrics.some((m) => m.kind === 'overall')">
      Esta revisión no define una puntuación general. Se muestran sus
      dimensiones disponibles.
    </p>
    <p v-if="!report.metrics.length">
      No hay dimensiones puntuadas en esta revisión.
    </p>
    <div class="demo-metrics-grid">
      <PublicationMetricCard
        v-for="(metric, index) in report.metrics"
        :key="metric.id"
        :metric="metric"
        :label="name(metric, index)"
      />
    </div>
    <details v-if="report.questions.length" class="demo-question-results">
      <summary>
        Ver resultados por pregunta ({{ report.questions.length }})
      </summary>
      <PublicationCharts
        context="admin"
        questions
        :items="
          report.questions.map((metric, index) => ({
            metric,
            label: name(metric, index, true),
          }))
        "
      />
      <div class="demo-metrics-grid">
        <PublicationMetricCard
          v-for="(metric, index) in report.questions"
          :key="metric.id"
          :metric="metric"
          :label="name(metric, index, true)"
        />
      </div>
    </details>
  </section>
</template>
