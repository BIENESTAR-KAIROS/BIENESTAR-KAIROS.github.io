<script setup lang="ts">
import { ref } from 'vue'
import type { ChartMetric } from '~/utils/helpers/publication-charts'
import {
  metricChartValues,
  metricChartCoverage,
} from '~/utils/helpers/publication-charts'
import {
  statisticNumber as number,
  statisticPercent as percent,
  publicationExplanation,
  scoringMethod,
} from '~/utils/translations/statistics-publication'

const props = withDefaults(
  defineProps<{
    items: ChartMetric[]
    context?: 'institution' | 'admin'
    questions?: boolean
  }>(),
  { context: 'institution', questions: false },
)
const rows = computed(() =>
  props.items.map(({ metric, label }) => ({
    metric,
    label,
    chart: metricChartValues(metric),
    coverage: metricChartCoverage(metric),
  })),
)
const scored = computed(() => rows.value.filter((row) => row.chart !== null))
const unavailable = computed(() =>
  rows.value.filter((row) => row.chart === null),
)
const view = ref<'comparison' | 'spread' | 'coverage'>('comparison')
</script>

<template>
  <section
    v-if="items.length"
    class="report-charts"
    :class="context"
    aria-label="Gráficas del informe"
  >
    <header class="charts-intro">
      <h3>{{ questions ? 'Gráficas por pregunta' : 'Resumen visual' }}</h3>
      <p>
        Consulta los valores y la cobertura junto a cada gráfica. Una puntuación
        más alta no siempre indica mayor bienestar: depende del cuestionario.
      </p>
    </header>
    <div class="chart-options" role="group" aria-label="Tipo de gráfica">
      <button
        type="button"
        :aria-pressed="view === 'comparison'"
        @click="view = 'comparison'"
      >
        Media y mediana
      </button>
      <button
        type="button"
        :aria-pressed="view === 'spread'"
        @click="view = 'spread'"
      >
        Dispersión
      </button>
      <button
        type="button"
        :aria-pressed="view === 'coverage'"
        @click="view = 'coverage'"
      >
        Cobertura
      </button>
    </div>
    <section
      v-show="view === 'comparison'"
      class="chart-panel"
      aria-label="Media y mediana"
    >
      <h4>
        Media y mediana{{ questions ? ' por pregunta' : ' por dimensión' }}
      </h4>
      <p>
        Cada fila tiene un eje propio, basado en sus resultados. Compara los
        valores dentro de cada fila; las longitudes entre filas no representan
        escalas equivalentes.
      </p>
      <p class="legend">
        <span><i class="mean-key" /> Media</span
        ><span><i class="median-key" /> Mediana</span>
      </p>
      <div v-for="row in scored" :key="row.metric.id" class="chart-row">
        <template v-if="row.chart">
          <div class="row-heading">
            <strong>{{ row.label }}</strong
            ><span
              >{{ row.metric.unit || 'Puntuación'
              }}<template v-if="row.metric.method">
                · {{ scoringMethod(row.metric.method) }}</template
              ></span
            >
          </div>
          <div class="plot" aria-hidden="true">
            <svg
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
              focusable="false"
            >
              <line x1="4" x2="96" y1="10" y2="10" class="axis" />
              <line
                :x1="row.chart.zero"
                :x2="row.chart.zero"
                y1="3"
                y2="17"
                class="zero"
              />
              <rect
                :x="row.chart.barStart"
                y="6"
                :width="row.chart.barWidth"
                height="8"
                rx="1"
                class="mean-bar"
              />
              <line
                :x1="row.chart.mean"
                :x2="row.chart.mean"
                y1="6"
                y2="14"
                class="mean-point"
              />
              <line
                :x1="row.chart.median"
                :x2="row.chart.median"
                y1="1"
                y2="19"
                class="median"
              />
            </svg>
            <div class="axis-labels">
              <span>{{ number(row.chart.start) }}</span
              ><span>{{ number(row.chart.end) }}</span>
            </div>
          </div>
          <p class="row-values">
            Media <strong>{{ number(row.chart.values.mean) }}</strong> · Mediana
            <strong>{{ number(row.chart.values.median) }}</strong> ·
            {{ number(row.chart.values.count) }} puntuaciones válidas
          </p>
        </template>
      </div>
      <p v-if="!scored.length" class="empty">
        No hay puntuaciones publicadas para dibujar esta gráfica.
      </p>
    </section>

    <section
      v-show="view === 'spread'"
      class="chart-panel"
      aria-label="Dispersión de puntuaciones"
    >
      <h4>Dispersión de puntuaciones</h4>
      <p>
        El punto representa la media y la línea abarca ±1 desviación estándar
        poblacional. Describe dispersión; no es un intervalo de confianza ni
        garantiza contener una proporción fija de participantes.
      </p>
      <p class="note">
        Ejes independientes por fila. El intervalo puede superar el mínimo y
        máximo observados; no representa los límites del cuestionario.
      </p>
      <div v-for="row in scored" :key="row.metric.id" class="chart-row">
        <template v-if="row.chart">
          <div class="row-heading">
            <strong>{{ row.label }}</strong
            ><span>{{ row.metric.unit || 'Puntuación' }}</span>
          </div>
          <div class="plot" aria-hidden="true">
            <svg
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
              focusable="false"
            >
              <line x1="4" x2="96" y1="10" y2="10" class="axis" />
              <line
                :x1="row.chart.low"
                :x2="row.chart.high"
                y1="10"
                y2="10"
                class="spread"
              />
              <line
                :x1="row.chart.low"
                :x2="row.chart.low"
                y1="5"
                y2="15"
                class="cap"
              />
              <line
                :x1="row.chart.high"
                :x2="row.chart.high"
                y1="5"
                y2="15"
                class="cap"
              />
            </svg>
            <span class="mean-dot" :style="{ left: `${row.chart.mean}%` }" />
            <div class="axis-labels">
              <span>{{ number(row.chart.start) }}</span
              ><span>{{ number(row.chart.end) }}</span>
            </div>
          </div>
          <p class="row-values">
            Media {{ number(row.chart.values.mean) }} · Desviación
            <strong>{{ number(row.chart.values.populationStdDev) }}</strong> ·
            Intervalo {{ number(row.chart.lower) }} a
            {{ number(row.chart.upper) }}
          </p>
        </template>
      </div>
      <p v-if="!scored.length" class="empty">
        No hay puntuaciones publicadas para dibujar esta gráfica.
      </p>
    </section>

    <aside
      v-if="unavailable.length"
      class="chart-panel"
      aria-label="Puntuaciones no representadas"
    >
      <h4>Puntuaciones no representadas</h4>
      <div v-for="row in unavailable" :key="row.metric.id" class="chart-row">
        <strong>{{ row.label }}</strong>
        <template v-if="row.metric.publicationStatus === 'suppressed'">
          <p v-for="reason in row.metric.reasons" :key="reason">
            {{ publicationExplanation(reason) }}
          </p>
        </template>
        <p v-else>Sin puntuación numérica. Consulta la cobertura disponible.</p>
      </div>
    </aside>

    <section
      v-show="view === 'coverage'"
      class="chart-panel"
      aria-label="Cobertura y omisiones obligatorias"
    >
      <h4>Cobertura y omisiones obligatorias</h4>
      <p>
        La cobertura muestra las puntuaciones válidas. Las omisiones
        obligatorias se calculan sobre todas las personas que presentaron la
        evaluación. Son indicadores separados; no se suman entre sí.
      </p>
      <p class="note">
        La marca indica el 10% de omisiones obligatorias: superar ese valor
        impide publicar el cálculo afectado. Las omisiones opcionales no usan
        ese umbral.
      </p>
      <div v-for="row in rows" :key="row.metric.id" class="chart-row">
        <strong>{{ row.label }}</strong>
        <template v-if="row.coverage">
          <p class="row-values">
            Puntuaciones válidas:
            <strong>{{ percent(row.coverage.score) }}</strong> ·
            {{ number(row.coverage.valid) }} de
            {{ number(row.coverage.denominator) }}
            {{
              row.coverage.question
                ? 'personas a quienes aplica'
                : 'participantes'
            }}
          </p>
          <div
            v-if="row.coverage.score !== null"
            class="coverage-track"
            aria-hidden="true"
          >
            <span :style="{ width: `${row.coverage.score * 100}%` }" />
          </div>
          <p class="row-values">
            Omisiones obligatorias:
            <strong>{{ percent(row.coverage.required) }}</strong> ·
            {{ number(row.coverage.requiredMissing) }} de
            {{ number(row.coverage.participants) }} participantes
          </p>
          <div
            v-if="row.coverage.required !== null"
            class="coverage-track missing"
            aria-hidden="true"
          >
            <span :style="{ width: `${row.coverage.required * 100}%` }" /><i
              class="threshold"
            />
          </div>
          <div class="axis-labels" aria-hidden="true">
            <span>0%</span><span>100%</span>
          </div>
        </template>
        <p v-else>La cobertura está protegida y no se representa.</p>
        <p v-for="warning in row.metric.warnings" :key="warning" class="note">
          {{ publicationExplanation(warning) }}
        </p>
      </div>
    </section>

    <details class="chart-panel chart-table">
      <summary>Ver datos de las gráficas en tabla</summary>
      <div
        class="table-scroll"
        tabindex="0"
        role="region"
        aria-label="Tabla de datos de las gráficas"
      >
        <table>
          <caption>
            Valores publicados. Los guiones indican datos no disponibles; no
            equivalen a cero.
          </caption>
          <thead>
            <tr>
              <th scope="col">Métrica</th>
              <th scope="col">Unidad</th>
              <th scope="col">Media</th>
              <th scope="col">Mediana</th>
              <th scope="col">Desviación estándar</th>
              <th scope="col">Media ±1 desviación</th>
              <th scope="col">Cobertura de puntuación</th>
              <th scope="col">Omisiones obligatorias</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.metric.id">
              <th scope="row">
                {{ row.label
                }}<span
                  v-if="row.metric.publicationStatus === 'suppressed'"
                  class="table-status"
                  >No publicado</span
                >
              </th>
              <td>{{ row.metric.unit || 'Puntuación' }}</td>
              <td>{{ row.chart ? number(row.chart.values.mean) : '—' }}</td>
              <td>{{ row.chart ? number(row.chart.values.median) : '—' }}</td>
              <td>
                {{
                  row.chart ? number(row.chart.values.populationStdDev) : '—'
                }}
              </td>
              <td>
                {{
                  row.chart
                    ? `${number(row.chart.lower)} a ${number(row.chart.upper)}`
                    : '—'
                }}
              </td>
              <td>{{ row.coverage ? percent(row.coverage.score) : '—' }}</td>
              <td>{{ row.coverage ? percent(row.coverage.required) : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </section>
</template>

<style scoped>
.report-charts {
  --chart-ink: #3c2f52;
  --chart-accent: #5c4a75;
  --chart-tint: #f0eaf5;
  display: grid;
  gap: 20px;
  min-width: 0;
  color: var(--chart-ink);
  font-family: 'Figtree', sans-serif;
}
.report-charts.admin {
  --chart-ink: #04474a;
  --chart-accent: #065c5d;
  --chart-tint: #eaf1f2;
}
.chart-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chart-options button {
  min-height: 44px;
  padding: 10px 18px;
  border: 1px solid var(--chart-accent);
  border-radius: 999px;
  color: var(--chart-ink);
  background: white;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.chart-options button[aria-pressed='true'] {
  background: var(--chart-ink);
  color: white;
}
.chart-options button:focus-visible {
  outline: 3px solid var(--chart-accent);
  outline-offset: 3px;
}
.chart-panel {
  padding: 24px;
  border: 1px solid var(--chart-tint);
  border-radius: 24px;
  background: #fff;
  min-width: 0;
}
h3 {
  font-size: 20px;
  font-weight: 800;
}
h4 {
  font-size: 18px;
  font-weight: 800;
}
p {
  font-size: 14px;
  line-height: 1.6;
  margin-top: 12px;
}
.note,
.axis-labels,
.row-heading span {
  color: #4b5f68;
}
.chart-row {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--chart-tint);
  min-width: 0;
  overflow-wrap: anywhere;
}
.row-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px 16px;
}
.row-heading span {
  font-size: 13px;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}
.legend span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.mean-key {
  display: inline-block;
  width: 24px;
  height: 8px;
  background: var(--chart-accent);
}
.median-key {
  display: inline-block;
  width: 0;
  height: 20px;
  border-left: 3px dashed #8a5a15;
}
.plot {
  position: relative;
  margin-top: 12px;
}
svg {
  display: block;
  width: 100%;
  height: 40px;
  overflow: visible;
}
svg line {
  vector-effect: non-scaling-stroke;
}
.axis {
  stroke: #b1bec4;
  stroke-width: 1;
}
.zero {
  stroke: #4b5f68;
  stroke-width: 1;
}
.mean-bar {
  fill: var(--chart-accent);
}
.mean-point {
  stroke: var(--chart-accent);
  stroke-width: 3;
}
.median {
  stroke: #8a5a15;
  stroke-width: 3;
  stroke-dasharray: 4 2;
}
.spread {
  stroke: var(--chart-accent);
  stroke-width: 4;
}
.cap {
  stroke: var(--chart-accent);
  stroke-width: 2;
}
.mean-dot {
  position: absolute;
  top: 20px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--chart-ink);
  border: 2px solid white;
  transform: translate(-50%, -50%);
}
.axis-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 0 4%;
}
.row-values {
  font-size: 13px;
}
.coverage-track {
  position: relative;
  height: 14px;
  background: var(--chart-tint);
  border-radius: 4px;
  margin-top: 8px;
}
.coverage-track span {
  display: block;
  height: 100%;
  background: var(--chart-accent);
  border-radius: inherit;
}
.coverage-track.missing {
  margin-bottom: 8px;
}
.missing span {
  background: #8a5a15;
}
.threshold {
  position: absolute;
  left: 10%;
  top: -4px;
  height: 22px;
  border-left: 2px dashed var(--chart-ink);
}
.coverage-track + .axis-labels {
  padding: 0;
}
.empty {
  padding: 16px;
  border-radius: 12px;
  background: var(--chart-tint);
}
summary {
  cursor: pointer;
  min-height: 44px;
  display: list-item;
  padding: 12px 0;
  font-weight: 700;
}
summary:focus-visible,
.table-scroll:focus-visible {
  outline: 3px solid var(--chart-accent);
  outline-offset: 3px;
  border-radius: 4px;
}
.table-scroll {
  overflow-x: auto;
  margin-top: 12px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
caption {
  text-align: left;
  padding: 12px 0;
}
th,
td {
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid var(--chart-tint);
  vertical-align: top;
}
thead {
  background: var(--chart-tint);
}
.table-status {
  display: block;
  font-weight: 400;
  margin-top: 8px;
}
@media (max-width: 700px) {
  .chart-panel {
    padding: 20px 16px;
  }
  .row-heading {
    display: grid;
    gap: 4px;
  }
}
</style>
