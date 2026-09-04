<script setup lang="ts">
import type { IDimensionDetail } from '~/interfaces/stats/institute-stats.interface'
import { WELLBEING_MAX, formatAverage } from './stats-config'

const props = defineProps<{ detail: IDimensionDetail | null }>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'filter-group', group: string): void
}>()

const signed = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value)}`

const points = computed(
  () => props.detail?.timeline.filter((point) => point.average !== null) ?? [],
)

/**
 * Escala local a la serie: seis meses de una dimensión se mueven décimas, y
 * dibujarlos contra el 1–5 completo aplanaría la línea hasta hacerla inútil.
 */
const scale = computed(() => {
  if (!points.value.length) return { min: 1, max: WELLBEING_MAX }
  const values = points.value.map((point) => point.average as number)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = Math.max(0.2, (max - min) * 0.4)

  return {
    min: Math.max(0, min - padding),
    max: Math.min(WELLBEING_MAX, max + padding),
  }
})

const barHeight = (average: number | null) => {
  if (average === null) return '0px'
  const { min, max } = scale.value
  const ratio = (average - min) / Math.max(max - min, 0.01)
  return `${Math.max(8, Math.round(ratio * 110) + 12)}px`
}

const groupWidth = (average: number) =>
  `${Math.min(100, (average / WELLBEING_MAX) * 100)}%`

const groupTone = (average: number) =>
  average < 3.2 ? 'low' : average < 3.65 ? 'mid' : 'high'

const lowestGroup = computed(() => props.detail?.byGroup[0] ?? null)

const trendLabel = computed(() => {
  if (!props.detail || props.detail.delta === null) return null
  const months = points.value.length
  return `${signed(props.detail.delta)}${months ? ` en ${months} ${months === 1 ? 'mes' : 'meses'}` : ''}`
})
</script>

<template>
  <v-dialog
    :model-value="Boolean(detail)"
    max-width="560"
    @update:model-value="emit('close')"
  >
    <div v-if="detail" class="detail">
      <header class="detail__head">
        <div class="detail__intro">
          <h2 class="detail__title">{{ detail.label }}</h2>
          <span class="detail__key"
            >{{ detail.key }} · promedio 1 a {{ WELLBEING_MAX }}</span
          >
        </div>
        <div class="detail__value">
          <span class="detail__number">{{
            formatAverage(detail.average)
          }}</span>
          <span
            v-if="trendLabel"
            class="detail__delta"
            :class="{ 'detail__delta--down': (detail.delta as number) < 0 }"
          >
            {{ trendLabel }}
          </span>
        </div>
      </header>

      <template v-if="points.length">
        <div class="chart">
          <div
            v-for="(point, index) in detail.timeline"
            :key="point.month"
            class="chart__col"
          >
            <span class="chart__value">{{ formatAverage(point.average) }}</span>
            <span
              class="chart__bar"
              :class="{
                'chart__bar--current': index === detail.timeline.length - 1,
              }"
              :style="{ height: barHeight(point.average) }"
            />
          </div>
        </div>
        <div class="months">
          <span
            v-for="point in detail.timeline"
            :key="`label-${point.month}`"
            class="months__label"
          >
            {{ point.month }}
          </span>
        </div>
      </template>

      <p v-else class="detail__empty">
        Todavía no hay meses anteriores con respuestas suficientes para dibujar
        la evolución de esta dimensión.
      </p>

      <section v-if="detail.byGroup.length" class="groups">
        <h3 class="groups__title">Dónde está más baja</h3>

        <div v-for="group in detail.byGroup" :key="group.group" class="group">
          <span class="group__label">{{ group.label }}</span>
          <span class="group__bar">
            <span
              class="group__fill"
              :class="`group__fill--${groupTone(group.average)}`"
              :style="{ width: groupWidth(group.average) }"
            />
          </span>
          <span class="group__value">{{ formatAverage(group.average) }}</span>
        </div>

        <p v-if="lowestGroup" class="groups__note">
          {{ lowestGroup.label }} es el grupo más bajo en esta dimensión.
          <button
            type="button"
            class="groups__link"
            @click="emit('filter-group', lowestGroup.group)"
          >
            Filtrar el tablero por ese grupo
          </button>
        </p>
      </section>

      <p v-else class="detail__empty">
        Ningún grupo alcanzó el mínimo de respuestas para publicarse por
        separado.
      </p>

      <div class="detail__actions">
        <button type="button" class="detail__close" @click="emit('close')">
          Cerrar
        </button>
      </div>
    </div>
  </v-dialog>
</template>

<style scoped>
.detail {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  font-family: 'Figtree', sans-serif;
}

.detail__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.detail__intro {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail__title {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #3c2f52;
  margin: 0;
}

.detail__key {
  font-size: 13px;
  color: #6b6080;
}

.detail__value {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.detail__number {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
  color: #3c2f52;
}

.detail__delta {
  font-size: 13px;
  font-weight: 800;
  color: #3f8f7e;
}

.detail__delta--down {
  color: #8a5a15;
}

.chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 130px;
  border-bottom: 2px solid #ece7f3;
  padding-bottom: 2px;
}

.chart__col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.chart__value {
  font-size: 11px;
  font-weight: 800;
  color: #6b6080;
}

.chart__bar {
  width: 100%;
  border-radius: 10px 10px 0 0;
  background: #e4dcf0;
}

.chart__bar--current {
  background: #8475a0;
}

.months {
  display: flex;
  gap: 12px;
}

.months__label {
  flex: 1;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: #9a90ad;
}

.detail__empty {
  font-size: 13px;
  line-height: 1.55;
  color: #6b6080;
  margin: 0;
}

.groups {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.groups__title {
  font-size: 14px;
  font-weight: 800;
  color: #3c2f52;
  margin: 0;
}

.group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group__label {
  flex: 0 0 130px;
  font-size: 13px;
  font-weight: 700;
  color: #4b3f60;
}

.group__bar {
  flex: 1;
  height: 12px;
  border-radius: 999px;
  background: #f4f1f8;
  display: flex;
  overflow: hidden;
}

.group__fill {
  border-radius: 999px;
}

.group__fill--low {
  background: #c77a1f;
}

.group__fill--mid {
  background: #8475a0;
}

.group__fill--high {
  background: #3f8f7e;
}

.group__value {
  flex: 0 0 32px;
  text-align: right;
  font-size: 13px;
  font-weight: 800;
  color: #3c2f52;
}

.groups__note {
  font-size: 13px;
  line-height: 1.55;
  color: #6b6080;
  margin: 0;
}

.groups__link {
  border: 0;
  background: transparent;
  padding: 0;
  font-family: 'Figtree', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #07979f;
  cursor: pointer;
  text-decoration: underline;
}

.detail__actions {
  display: flex;
  justify-content: flex-end;
}

.detail__close {
  height: 42px;
  padding: 0 20px;
  border: 2px solid #ded6ea;
  border-radius: 999px;
  background: #fff;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #3c2f52;
  cursor: pointer;
}

.detail__close:hover {
  border-color: #8475a0;
  color: #8475a0;
}

@media (max-width: 600px) {
  .group__label {
    flex: 0 0 96px;
  }
}
</style>
