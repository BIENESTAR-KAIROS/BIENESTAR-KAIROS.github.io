<script setup lang="ts">
import type {
  ComparisonResult,
  ComparisonKind,
} from '~/interfaces/stats/questionnaire-comparison.interface'

const props = defineProps<{
  result: ComparisonResult
  participants: number
  metricLabel: string
  question: string
  kind: ComparisonKind
  demo?: boolean
}>()
const format = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 3 })
const plot = computed(() => {
  const rows = props.result.groups.flatMap(({ label, mean, count }) =>
    mean === null ? [] : [{ label, mean, count }],
  )
  if (!rows.length) return null
  const means = rows.map((row) => row.mean)
  const min = Math.floor(Math.min(0, ...means))
  const max = Math.ceil(Math.max(min === 0 ? 1 : 0, ...means))
  return {
    min,
    max,
    rows: rows.map((row) => ({
      ...row,
      position: ((row.mean - min) / (max - min)) * 100,
    })),
  }
})
</script>
<template>
  <div aria-live="polite">
    <p>
      <strong
        >{{ result.paired }} de {{ participants }} participantes
        <template v-if="demo">demo</template></strong
      >
      tienen una respuesta y un puntaje válidos para esta comparación.
    </p>
    <template v-if="result.paired">
      <p v-if="kind === 'number'">
        {{
          result.pearson === null
            ? 'El coeficiente de Pearson requiere variación en ambas medidas y al menos dos pares.'
            : 'Correlación de Pearson (r) = ' + format.format(result.pearson)
        }}
      </p>
      <template v-else>
        <p v-if="kind === 'multiple_choice'">
          Una persona puede contar en varias opciones si eligió más de una
          respuesta.
        </p>
        <div class="comparison-details">
          <figure v-if="plot" class="dot-plot">
            <figcaption>Puntaje medio · {{ metricLabel }}</figcaption>
            <p>{{ question }}</p>
            <div class="plot-grid" aria-hidden="true">
              <template v-for="(row, i) in plot.rows" :key="i">
                <div class="group-label">
                  {{ row.label }} <small>n = {{ row.count }}</small>
                </div>
                <div class="track">
                  <span class="dot" :style="{ left: row.position + '%' }" />
                </div>
                <span class="score">{{ format.format(row.mean) }}</span>
              </template>
              <div class="axis">
                <span>{{ format.format(plot.min) }}</span
                ><span>{{ format.format(plot.max) }}</span>
              </div>
            </div>
          </figure>
          <table>
            <caption>
              Puntaje por respuesta a «{{
                question
              }}»
            </caption>
            <thead>
              <tr>
                <th scope="col">Respuesta</th>
                <th scope="col">Participantes</th>
                <th scope="col">Puntaje medio</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(g, i) in result.groups" :key="i">
                <th scope="row">{{ g.label }}</th>
                <td>{{ g.count }}</td>
                <td>{{ g.mean === null ? '—' : format.format(g.mean) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="result.etaSquared !== null">
          El {{ format.format(result.etaSquared * 100) }} % de la variación del
          puntaje corresponde a diferencias entre las medias de los grupos (η²).
        </p>
      </template>
    </template>
  </div>
</template>
<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  overflow-wrap: anywhere;
}
.comparison-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
  align-items: start;
  gap: 16px 28px;
  margin: 12px 0;
}
.comparison-details table {
  margin: 0;
}
.dot-plot {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
}
figcaption {
  padding: 8px 0;
  font-weight: 700;
}
.plot-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr) auto;
  align-items: center;
  gap: 12px 14px;
  margin-top: 16px;
  font-variant-numeric: tabular-nums;
}
.group-label small {
  display: block;
}
.track {
  position: relative;
  height: 2px;
  background: #ded9e4;
}
.dot {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--ink);
}
.score {
  text-align: end;
}
.axis {
  grid-column: 2;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid currentColor;
  font-size: 0.875rem;
}
caption {
  text-align: left;
  font-weight: 700;
  padding: 8px 0;
}
th,
td {
  text-align: start;
  padding: 8px 4px;
  border-bottom: 1px solid #ded9e4;
}
td {
  font-variant-numeric: tabular-nums;
}
</style>
