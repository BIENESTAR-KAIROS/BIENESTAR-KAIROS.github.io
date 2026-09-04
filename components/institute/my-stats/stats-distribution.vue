<script setup lang="ts">
import type {
  IScoreBucket,
  IStatsBand,
} from '~/interfaces/stats/institute-stats.interface'
import { SCORE_BANDS } from './stats-config'

const props = defineProps<{
  distribution: IScoreBucket[]
  bands: IStatsBand[]
  total: number
  /** En móvil el histograma no se lee: se cambia por una barra apilada. */
  compact?: boolean
}>()

const emit = defineEmits<{ (event: 'see-attention'): void }>()

const formatNumber = (value: number) => value.toLocaleString('es-MX')

const maxCount = computed(() =>
  Math.max(1, ...props.distribution.map((bucket) => bucket.count)),
)

const barHeight = (count: number) =>
  `${Math.max(4, Math.round((count / maxCount.value) * 190))}px`

const bandMeta = (key: string) => SCORE_BANDS.find((band) => band.key === key)

/** Los tramos agrupados por franja, para pintar el fondo de cada bloque. */
const groups = computed(() =>
  SCORE_BANDS.map((band) => ({
    ...band,
    buckets: props.distribution.filter((bucket) => bucket.band === band.key),
  })).filter((group) => group.buckets.length),
)

const attentionBand = computed(() =>
  props.bands.find((band) => band.key === 'attention'),
)
</script>

<template>
  <section class="panel">
    <header class="panel__head">
      <div class="panel__intro">
        <h2 class="panel__title">
          {{ compact ? 'Cómo se reparte' : 'Cómo se reparte tu población' }}
        </h2>
        <p v-if="!compact" class="panel__subtitle">
          Score total por rangos, con las tres franjas de atención marcadas.
        </p>
      </div>
      <span v-if="!compact" class="panel__pill"
        >n = {{ formatNumber(total) }}</span
      >
    </header>

    <!-- Barra apilada: en 390px las proporciones sí se leen, las 8 barras no. -->
    <div v-if="compact" class="stacked">
      <span
        v-for="band in bands"
        :key="band.key"
        class="stacked__slice"
        :class="`stacked__slice--${band.key}`"
        :style="{ width: `${band.percent}%` }"
      >
        <template v-if="band.percent >= 10">{{ band.percent }}%</template>
      </span>
    </div>

    <template v-else>
      <div class="chart">
        <div
          v-for="group in groups"
          :key="group.key"
          class="chart__group"
          :class="`chart__group--${group.key}`"
          :style="{ flexGrow: group.buckets.length }"
        >
          <div
            v-for="bucket in group.buckets"
            :key="bucket.label"
            class="chart__bar"
          >
            <span class="chart__count">{{ bucket.count }}</span>
            <span
              class="chart__fill"
              :style="{ height: barHeight(bucket.count) }"
            />
          </div>
        </div>
      </div>

      <div class="axis">
        <div
          v-for="group in groups"
          :key="group.key"
          class="axis__group"
          :style="{ flexGrow: group.buckets.length }"
        >
          <span
            v-for="bucket in group.buckets"
            :key="bucket.label"
            class="axis__label"
          >
            {{ bucket.label }}
          </span>
        </div>
      </div>
    </template>

    <div class="bands" :class="{ 'bands--compact': compact }">
      <div
        v-for="band in bands"
        :key="band.key"
        class="band"
        :class="`band--${band.key}`"
      >
        <span v-if="compact" class="band__dot" />
        <span class="band__label">{{ bandMeta(band.key)?.label }}</span>
        <span class="band__value">
          {{ formatNumber(band.count) }}
          <span v-if="!compact" class="band__percent"
            >· {{ band.percent }}%</span
          >
        </span>
        <button
          v-if="!compact && band.key === 'attention' && band.count"
          type="button"
          class="band__link"
          @click="emit('see-attention')"
        >
          Ver en Mis usuarios
        </button>
        <span v-else-if="!compact" class="band__hint">{{
          bandMeta(band.key)?.hint
        }}</span>
      </div>
    </div>

    <button
      v-if="compact && attentionBand?.count"
      type="button"
      class="cta"
      @click="emit('see-attention')"
    >
      Ver los {{ formatNumber(attentionBand.count) }} en Mis usuarios
    </button>
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

.chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 210px;
  padding: 0 2px;
  overflow-x: auto;
}

.chart__group {
  flex: 1 1 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 6px;
  border-radius: 14px 14px 0 0;
  padding: 0 8px;
  min-width: 0;
}

.chart__group--attention {
  background: #fbf3e8;
}

.chart__group--average {
  background: #f4f1f8;
}

.chart__group--high {
  background: #edf6f3;
}

.chart__bar {
  flex: 1 1 0;
  min-width: 34px;
  max-width: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.chart__count {
  font-size: 12px;
  font-weight: 800;
  color: #5c4a75;
}

.chart__group--attention .chart__count {
  color: #8a5a15;
}

.chart__group--high .chart__count {
  color: #2c6a5c;
}

.chart__fill {
  width: 100%;
  border-radius: 8px 8px 0 0;
  background: #8475a0;
}

.chart__group--attention .chart__fill {
  background: #c77a1f;
}

.chart__group--high .chart__fill {
  background: #3f8f7e;
}

.axis {
  display: flex;
  gap: 6px;
  padding: 10px 2px 0;
  border-top: 2px solid #ece7f3;
}

.axis__group {
  flex: 1 1 0;
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 0 8px;
  min-width: 0;
}

.axis__label {
  flex: 1 1 0;
  min-width: 34px;
  max-width: 56px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: #9a90ad;
}

.stacked {
  height: 34px;
  border-radius: 12px;
  display: flex;
  overflow: hidden;
  font-size: 12px;
  font-weight: 800;
  color: #fff;
}

.stacked__slice {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: width 0.25s ease;
}

.stacked__slice--attention {
  background: #c77a1f;
}

.stacked__slice--average {
  background: #8475a0;
}

.stacked__slice--high {
  background: #3f8f7e;
}

.bands {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.band {
  border-radius: 18px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.band--attention {
  background: #fbf3e8;
}

.band--average {
  background: #f4f1f8;
}

.band--high {
  background: #edf6f3;
}

.band__label {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #5c4a75;
}

.band--attention .band__label {
  color: #8a5a15;
}

.band--high .band__label {
  color: #2c6a5c;
}

.band__value {
  font-size: 22px;
  font-weight: 800;
  color: #3c2f52;
}

.band__percent {
  font-size: 14px;
  font-weight: 700;
  color: #6b6080;
}

.band__hint {
  font-size: 13px;
  color: #6b6080;
}

.band__link {
  border: 0;
  background: transparent;
  padding: 0;
  text-align: left;
  font-family: 'Figtree', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #8a5a15;
  cursor: pointer;
}

/* En móvil las franjas son una leyenda de la barra apilada, no tarjetas. */
.bands--compact {
  grid-template-columns: 1fr;
  gap: 10px;
}

.bands--compact .band {
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 0;
  background: transparent;
}

.band__dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  flex: 0 0 12px;
}

.band--attention .band__dot {
  background: #c77a1f;
}

.band--average .band__dot {
  background: #8475a0;
}

.band--high .band__dot {
  background: #3f8f7e;
}

.bands--compact .band__label {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
  color: #3c2f52;
}

.bands--compact .band__value {
  font-size: 14px;
}

.cta {
  height: 46px;
  border: 0;
  border-radius: 999px;
  background: #fbf3e8;
  color: #8a5a15;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}

@media (max-width: 700px) {
  .panel {
    padding: 18px;
  }

  .bands {
    grid-template-columns: 1fr;
  }
}
</style>
