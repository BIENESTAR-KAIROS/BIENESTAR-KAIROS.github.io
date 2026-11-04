<script setup lang="ts">
import type {
  StatisticsPublicationResponse,
  PublicationLabels,
  PublicationMetric,
} from '~/interfaces/stats/statistics-publication.interface'
import {
  publicationExplanation,
  statisticNumber as number,
} from '~/utils/translations/statistics-publication'
import { formatPeriodInstant } from '~/utils/helpers/statistics-period-time'
import PublicationMetricCard from './publication-metric.vue'
const props = defineProps<{
  response: StatisticsPublicationResponse
  labels: PublicationLabels
  title: string
}>()
const report = computed(() => props.response.report)
const metricLabel = (m: PublicationMetric, index: number) =>
  props.labels.metrics[m.id] ||
  (m.kind === 'overall'
    ? 'Resultado general'
    : `Dimensión ${index + 1} · ${m.id}`)
</script>

<template>
  <section class="publication-report" aria-label="Informe estadístico">
    <div
      v-if="response.status === 'suppressed'"
      class="panel protected"
      role="status"
    >
      <h2>Informe no publicado</h2>
      <p>{{ publicationExplanation('insufficient_cohort') }}</p>
      <p>
        No se muestran conteos ni se distingue entre ausencia de entregas y
        grupos pequeños.
      </p>
    </div>
    <template v-else-if="report">
      <header class="panel">
        <p class="eyebrow">Alumnos reales · Informe fijado</p>
        <h2>{{ title }}</h2>
        <p>
          Revisión {{ report.scope.revision.definitionRevision }} ·
          {{ number(report.participants) }} participantes
        </p>
        <p>
          {{ formatPeriodInstant(report.scope.from, 'America/Mexico_City') }} →
          {{ formatPeriodInstant(report.scope.until, 'America/Mexico_City') }}
          (fin sin incluir).
        </p>
        <p>
          Calculado el
          {{ formatPeriodInstant(report.calculatedAt, 'America/Mexico_City') }}
          · America/Mexico_City
        </p>
        <p>
          Se usa el último intento presentado por persona dentro de este período
          y revisión. Este informe permanece igual en consultas posteriores,
          aunque lleguen respuestas tardías.
        </p>
        <p v-for="reason in report.reasons" :key="reason">
          {{ publicationExplanation(reason) }}
        </p>
      </header>
      <h2>Resultado general y dimensiones</h2>
      <p v-if="!report.metrics.some((m) => m.kind === 'overall')">
        Esta revisión no define un resultado general; se muestran únicamente las
        dimensiones definidas.
      </p>
      <p v-if="!report.metrics.length" class="panel">
        Esta revisión no tiene métricas generales ni dimensiones puntuadas.
      </p>
      <div class="metrics-grid">
        <PublicationMetricCard
          v-for="(metric, index) in report.metrics"
          :key="metric.id"
          :metric="metric"
          :label="metricLabel(metric, index)"
        />
      </div>
      <section class="panel" aria-labelledby="retakes-title">
        <h2 id="retakes-title">Reintentos dentro del período</h2>
        <template v-if="report.retakes">
          <dl class="retakes">
            <div>
              <dt>Promedio de reintentos por participante</dt>
              <dd>{{ number(report.retakes.average) }}</dd>
            </div>
            <div>
              <dt>Total de reintentos</dt>
              <dd>{{ number(report.retakes.total) }}</dd>
            </div>
            <div>
              <dt>Personas que repitieron</dt>
              <dd>{{ number(report.retakes.participantsWithRetakes) }}</dd>
            </div>
            <div>
              <dt>Promedio entre quienes repitieron</dt>
              <dd>
                {{
                  report.retakes.averageAmongRepeaters === null
                    ? 'No aplica'
                    : number(report.retakes.averageAmongRepeaters)
                }}
              </dd>
            </div>
          </dl>
          <p>
            El promedio general incluye a quienes no repitieron. Cuenta
            presentaciones adicionales; no promedia las calificaciones de
            intentos anteriores.
          </p>
        </template>
        <div v-else class="protected">
          <p v-for="reason in report.retakeReasons" :key="reason">
            {{ publicationExplanation(reason) }}
          </p>
        </div>
      </section>
      <details v-if="report.questions.length" class="questions">
        <summary>Ver resultados por pregunta</summary>
        <div class="metrics-grid">
          <PublicationMetricCard
            v-for="(question, index) in report.questions"
            :key="question.id"
            :metric="question"
            :label="
              labels.questions[question.id] ||
              `Pregunta ${index + 1} · ${question.id}`
            "
          />
        </div>
      </details>
      <p class="footnote">
        Mínimo de {{ report.minCohort }} participantes por grupo y cálculo. Más
        del 10% de omisiones obligatorias impide publicar el cálculo afectado.
        Las reglas de privacidad también pueden proteger resultados
        relacionados. Valores redondeados solo para su presentación.
      </p>
    </template>
  </section>
</template>

<style scoped>
.publication-report {
  display: grid;
  gap: 20px;
  min-width: 0;
  color: #3c2f52;
  font-family: 'Figtree', sans-serif;
}
.panel {
  background: white;
  border: 1px solid #efebf5;
  border-radius: 24px;
  padding: 24px;
  min-width: 0;
  overflow-wrap: anywhere;
}
h2 {
  font-size: 20px;
  font-weight: 800;
}
p {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.6;
}
.eyebrow {
  margin-top: 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 800;
}
.protected {
  color: #5c4a75;
  background: #f0eaf5;
  border-radius: 16px;
  padding: 20px;
}
.metrics-grid,
.retakes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}
.retakes {
  margin-top: 20px;
}
dt {
  font-size: 14px;
}
dd {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
}
summary {
  cursor: pointer;
  padding: 12px 0;
  min-height: 44px;
  font-weight: 800;
}
summary:focus-visible {
  outline: 3px solid #5c4a75;
  outline-offset: 3px;
  border-radius: 8px;
}
.footnote {
  color: #6b6080;
}
@media (max-width: 1100px) {
  .metrics-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 700px) {
  .panel {
    padding: 20px;
  }
  .retakes {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
