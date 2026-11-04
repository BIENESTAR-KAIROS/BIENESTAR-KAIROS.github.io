<script setup lang="ts">
import type { PublicationMetric } from '~/interfaces/stats/statistics-publication.interface'
import {
  publicationExplanation,
  statisticNumber as number,
  statisticPercent as percent,
  scoringMethod,
} from '~/utils/translations/statistics-publication'
defineProps<{ metric: PublicationMetric; label: string }>()
</script>

<template>
  <article class="publication-metric">
    <h3>{{ label }}</h3>
    <p class="meta">
      {{
        metric.kind === 'question'
          ? 'Pregunta'
          : metric.kind === 'overall'
            ? 'Resultado general'
            : 'Dimensión'
      }}<template v-if="metric.unit"> · {{ metric.unit }}</template
      ><template v-if="metric.method">
        · {{ scoringMethod(metric.method) }}</template
      >
    </p>
    <template v-if="metric.publicationStatus === 'published' && metric.values">
      <dl class="values">
        <div>
          <dt>Media</dt>
          <dd>{{ number(metric.values.mean) }}</dd>
        </div>
        <div>
          <dt>Mediana</dt>
          <dd>{{ number(metric.values.median) }}</dd>
        </div>
        <div>
          <dt>Moda</dt>
          <dd class="modes">
            {{
              metric.values.modeStatus === 'no_mode'
                ? 'Sin moda'
                : metric.values.modes.map(number).join(' · ')
            }}
          </dd>
        </div>
        <div>
          <dt>Desviación estándar poblacional</dt>
          <dd>{{ number(metric.values.populationStdDev) }}</dd>
        </div>
      </dl>
      <p>
        {{ number(metric.values.count) }} puntuaciones válidas · Mínimo
        {{ number(metric.values.min) }} · Máximo {{ number(metric.values.max) }}
      </p>
    </template>
    <p v-else-if="metric.publicationStatus === 'published'">
      Pregunta informativa: se muestra su cobertura, sin calcular puntuaciones
      numéricas.
    </p>
    <div v-else class="notice protected">
      <strong>Resultado no publicado</strong>
      <p v-for="reason in metric.reasons" :key="reason">
        {{ publicationExplanation(reason) }}
      </p>
    </div>
    <div v-if="metric.warnings.length" class="notice warning">
      <p v-for="warning in metric.warnings" :key="warning">
        {{ publicationExplanation(warning) }}
      </p>
    </div>
    <details v-if="metric.coverage">
      <summary>Cobertura y calidad de los datos</summary>
      <dl class="coverage">
        <div>
          <dt>Personas que presentaron la evaluación</dt>
          <dd>{{ number(metric.coverage.participants) }}</dd>
        </div>
        <div>
          <dt>Personas a quienes aplica</dt>
          <dd>{{ number(metric.coverage.applicable) }}</dd>
        </div>
        <div
          v-if="metric.kind === 'question' && metric.coverage.answered !== null"
        >
          <dt>Respuestas contestadas</dt>
          <dd>{{ number(metric.coverage.answered) }}</dd>
        </div>
        <div>
          <dt>
            {{
              metric.kind === 'question'
                ? 'Respuestas válidas'
                : 'Puntuaciones válidas'
            }}
          </dt>
          <dd>{{ number(metric.coverage.valid) }}</dd>
        </div>
        <div>
          <dt>
            {{
              metric.kind === 'question'
                ? 'Cobertura de respuesta entre personas a quienes aplica'
                : 'Cobertura de puntuación entre participantes'
            }}
          </dt>
          <dd>{{ percent(metric.coverage.fraction) }}</dd>
        </div>
        <div v-if="metric.coverage.scoreFraction !== null">
          <dt>Cobertura de puntuación entre personas a quienes aplica</dt>
          <dd>{{ percent(metric.coverage.scoreFraction) }}</dd>
        </div>
        <div>
          <dt>Ausentes</dt>
          <dd>{{ number(metric.coverage.missing) }}</dd>
        </div>
        <div>
          <dt>Inválidas</dt>
          <dd>{{ number(metric.coverage.invalid) }}</dd>
        </div>
        <div>
          <dt>No aplicables</dt>
          <dd>{{ number(metric.coverage.notApplicable) }}</dd>
        </div>
        <div>
          <dt>Contestadas sin puntuación</dt>
          <dd>{{ number(metric.coverage.unscored) }}</dd>
        </div>
        <div>
          <dt>Personas con omisiones obligatorias</dt>
          <dd>{{ number(metric.coverage.requiredMissing) }}</dd>
        </div>
        <div v-if="metric.coverage.requiredMissingFraction !== null">
          <dt>Omisiones obligatorias entre todos los participantes</dt>
          <dd>{{ percent(metric.coverage.requiredMissingFraction) }}</dd>
        </div>
        <div v-if="metric.coverage.requiredMissingApplicableFraction !== null">
          <dt>Omisiones obligatorias entre personas a quienes aplica</dt>
          <dd>
            {{ percent(metric.coverage.requiredMissingApplicableFraction) }}
          </dd>
        </div>
      </dl>
      <p>
        Las puntuaciones ausentes no se convierten en cero. El porcentaje de
        omisión describe datos faltantes, no la magnitud del sesgo.
      </p>
    </details>
    <p v-else class="meta">La cobertura también está protegida.</p>
  </article>
</template>

<style scoped>
.publication-metric {
  background: white;
  border: 1px solid #efebf5;
  border-radius: 24px;
  padding: 24px;
  min-width: 0;
  overflow-wrap: anywhere;
}
h3 {
  font-size: 18px;
  font-weight: 800;
}
p {
  margin-top: 12px;
  line-height: 1.6;
  font-size: 14px;
}
.meta {
  color: #6b6080;
  font-size: 13px;
}
.values {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 24px;
}
dt {
  font-size: 13px;
  line-height: 1.5;
}
.values dd {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
}
.values .modes {
  font-size: 20px;
}
.notice {
  padding: 16px;
  border-radius: 16px;
  margin-top: 16px;
}
.notice p:first-child {
  margin-top: 0;
}
.protected {
  color: #5c4a75;
  background: #f0eaf5;
}
.warning {
  color: #8a5a15;
  background: #fbf3e8;
}
details {
  margin-top: 20px;
}
summary {
  cursor: pointer;
  padding: 12px 0;
  min-height: 44px;
  font-weight: 700;
}
summary:focus-visible {
  outline: 3px solid #5c4a75;
  outline-offset: 3px;
  border-radius: 8px;
}
.coverage > div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #efebf5;
}
.coverage dd {
  margin: 0;
  font-weight: 700;
  flex-shrink: 0;
}
@media (max-width: 700px) {
  .publication-metric {
    padding: 20px;
  }
}
</style>
