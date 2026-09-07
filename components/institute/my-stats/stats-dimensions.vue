<script setup lang="ts">
import type { IStatsDimension } from '~/interfaces/stats/institute-stats.interface'
import { WELLBEING_MAX, formatAverage } from './stats-config'

const props = defineProps<{
  dimensions: IStatsDimension[]
  hasComparison: boolean
  compact?: boolean
}>()

const emit = defineEmits<{ (event: 'open', key: string): void }>()

const width = (average: number) =>
  `${Math.min(100, (average / WELLBEING_MAX) * 100)}%`

const signed = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value)}`

/**
 * El color no es decorativo: marca en qué franja cae la dimensión, con los
 * mismos cortes que el histograma de scores.
 */
const tone = (average: number) =>
  average < 3.2 ? 'low' : average < 3.65 ? 'mid' : 'high'

const lowest = computed(() => props.dimensions[0] ?? null)
</script>

<template>
  <section class="panel">
    <header class="panel__head">
      <div class="panel__intro">
        <h2 class="panel__title">
          {{
            compact
              ? 'De menor a mayor'
              : 'Las cinco dimensiones, de menor a mayor'
          }}
        </h2>
        <p class="panel__subtitle">
          Promedio 1 a {{ WELLBEING_MAX }}.
          <template v-if="!compact">
            Sustituye al radar: en barras ordenadas se ve de inmediato cuál
            atender primero.
          </template>
          <template v-else-if="hasComparison"> · vs. periodo anterior</template>
        </p>
      </div>
      <span v-if="!compact && hasComparison" class="panel__pill"
        >vs. periodo anterior</span
      >
    </header>

    <div class="list">
      <button
        v-for="(dimension, index) in dimensions"
        :key="dimension.key"
        type="button"
        class="row"
        @click="emit('open', dimension.key)"
      >
        <div class="row__head">
          <span class="row__label">{{ dimension.label }}</span>
          <span class="row__values">
            <span class="row__average">{{
              formatAverage(dimension.average)
            }}</span>
            <span
              v-if="dimension.delta !== null"
              class="row__delta"
              :class="{ 'row__delta--down': dimension.delta < 0 }"
            >
              {{ signed(dimension.delta) }}
            </span>
          </span>
        </div>

        <span class="row__bar">
          <span
            class="row__bar-fill"
            :class="`row__bar-fill--${tone(dimension.average)}`"
            :style="{ width: width(dimension.average) }"
          />
        </span>

        <span v-if="!compact && index === 0" class="row__note">
          La más baja de las cinco y la que jala el promedio general.
        </span>
      </button>
    </div>

    <div v-if="!compact && lowest" class="suggestion">
      <p class="suggestion__text">
        Con <strong>{{ lowest.label.toLowerCase() }}</strong> como dimensión más
        baja, Kairos sugiere reforzar las recomendaciones de esa área para esta
        población.
      </p>
      <button
        type="button"
        class="suggestion__button"
        @click="emit('open', lowest.key)"
      >
        Ver detalle
      </button>
    </div>
  </section>
</template>

<style scoped>
.panel {
  background: #fff;
  border: 1px solid #efebf5;
  border-radius: 24px;
  padding: 26px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.panel__intro {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.panel__title {
  font-size: 18px;
  font-weight: 800;
  color: #3c2f52;
  margin: 0;
}

.panel__subtitle {
  font-size: 14px;
  color: #4b3f60;
  margin: 0;
}

.panel__pill {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 13px;
  border-radius: 999px;
  background: #f0eaf5;
  color: #5c4a75;
  font-size: 12px;
  font-weight: 700;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 6px 8px;
  margin: -6px -8px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  font-family: 'Figtree', sans-serif;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.row:hover,
.row:focus-visible {
  background: #f7f4fa;
}

.row__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.row__label {
  font-size: 15px;
  font-weight: 700;
  color: #3c2f52;
}

.row__values {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.row__average {
  font-size: 16px;
  font-weight: 800;
  color: #3c2f52;
}

.row__delta {
  font-size: 13px;
  font-weight: 800;
  color: #3f8f7e;
}

.row__delta--down {
  color: #8a5a15;
}

.row__bar {
  height: 14px;
  border-radius: 999px;
  background: #f4f1f8;
  display: flex;
  overflow: hidden;
}

.row__bar-fill {
  border-radius: 999px;
  transition: width 0.25s ease;
}

.row__bar-fill--low {
  background: #c77a1f;
}

.row__bar-fill--mid {
  background: #8475a0;
}

.row__bar-fill--high {
  background: #3f8f7e;
}

.row__note {
  font-size: 13px;
  color: #6b6080;
}

.suggestion {
  margin-top: auto;
  background: #f7f4fa;
  border-radius: 20px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.suggestion__text {
  flex: 1;
  font-size: 14px;
  line-height: 1.55;
  color: #4b3f60;
  margin: 0;
}

.suggestion__text strong {
  color: #3c2f52;
}

.suggestion__button {
  flex: 0 0 auto;
  height: 42px;
  padding: 0 20px;
  border: 0;
  border-radius: 999px;
  background: #8475a0;
  color: #fff;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.suggestion__button:hover {
  background: #6d5f88;
}

@media (max-width: 700px) {
  .panel {
    padding: 20px;
    gap: 16px;
  }

  .suggestion {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
