<script setup lang="ts">
import type { QuestionnaireMetric } from '~/interfaces/stats/questionnaire-stats.interface'
const props = defineProps<{
  metric: QuestionnaireMetric
  minGroupSize: number
}>()
const format = (n: number | null) =>
  n === null ? '—' : n.toLocaleString('es-MX', { maximumFractionDigits: 2 })
const largest = computed(() =>
  Math.max(1, ...props.metric.distribution.map((b) => b.count)),
)
</script>
<template>
  <article class="metric">
    <h3>{{ metric.label }}</h3>
    <template v-if="metric.sampleSufficient">
      <p class="metric__value">
        {{ format(metric.mean) }}
        <span>{{ metric.unit || 'puntos' }} · promedio</span>
      </p>
      <p>
        {{ metric.n.toLocaleString('es-MX') }} resultados válidos ·
        {{ metric.missing }} sin puntaje
      </p>
      <p>
        Rango observado: {{ format(metric.min) }}–{{ format(metric.max) }} ·
        Desviación: {{ format(metric.std) }}
      </p>
      <div class="metric__bars" aria-label="Distribución de puntajes">
        <div
          v-for="(bucket, index) in metric.distribution"
          :key="index"
          class="metric__row"
        >
          <span>{{ format(bucket.from) }}–{{ format(bucket.to) }}</span>
          <span class="metric__track" aria-hidden="true"
            ><span :style="{ width: `${(bucket.count / largest) * 100}%` }"
          /></span>
          <strong>{{ bucket.count }}</strong>
        </div>
      </div>
      <details v-if="metric.bands.length || metric.interpretations.length">
        <summary>Interpretaciones del cuestionario</summary>
        <ul>
          <li v-for="band in metric.bands" :key="band.label">
            {{ band.label }}: {{ band.count }}
          </li>
        </ul>
        <p v-for="(band, index) in metric.interpretations" :key="index">
          {{ band.label }}: desde {{ format(band.min)
          }}{{ band.max != null ? ` hasta ${format(band.max)}` : '' }}
        </p>
      </details>
      <details v-if="metric.timeline.length">
        <summary>Promedio por mes</summary>
        <table>
          <caption>
            Última respuesta por alumno en el periodo seleccionado
          </caption>
          <thead>
            <tr>
              <th scope="col">Mes</th>
              <th scope="col">Promedio</th>
              <th scope="col">Resultados</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="point in metric.timeline" :key="point.month">
              <th scope="row">{{ point.month }}</th>
              <td>{{ format(point.mean) }}</td>
              <td>{{ point.n }}</td>
            </tr>
          </tbody>
        </table>
        <p>
          Solo se muestran meses con al menos {{ minGroupSize }} resultados
          válidos.
        </p>
      </details>
    </template>
    <p v-else role="status">
      {{ metric.n }} resultados válidos. Se necesitan al menos
      {{ minGroupSize }} para mostrar los puntajes. Los valores faltantes no se
      cuentan como cero.
    </p>
  </article>
</template>
<style scoped>
.metric {
  padding: 24px;
  border: 1px solid #efebf5;
  border-radius: 24px;
  background: #fff;
  min-width: 0;
}
h3 {
  font-size: 18px;
  font-weight: 800;
}
p {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.6;
}
.metric__value {
  font-size: 38px;
  font-weight: 800;
}
.metric__value span {
  font-size: 14px;
  font-weight: 600;
}
.metric__bars {
  margin: 20px 0;
  display: grid;
  gap: 10px;
}
.metric__row {
  display: grid;
  grid-template-columns: 105px minmax(0, 1fr) 40px;
  gap: 12px;
  align-items: center;
  font-size: 13px;
}
.metric__row strong {
  text-align: right;
}
.metric__track {
  background: #f0eaf5;
  height: 14px;
  border-radius: 999px;
  overflow: hidden;
}
.metric__track > span {
  display: block;
  height: 100%;
  background: #8475a0;
  border-radius: inherit;
}
details {
  margin-top: 20px;
}
summary {
  min-height: 44px;
  padding: 10px 0;
  cursor: pointer;
  font-weight: 700;
}
summary:focus-visible {
  outline: 3px solid #5c4a75;
  outline-offset: 3px;
  border-radius: 8px;
}
ul {
  padding-left: 20px;
  font-size: 14px;
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
  padding: 10px 4px;
  border-bottom: 1px solid #efebf5;
}
@media (max-width: 700px) {
  .metric {
    padding: 20px;
  }
  .metric__row {
    grid-template-columns: 90px minmax(0, 1fr) 32px;
    gap: 8px;
  }
}
</style>
