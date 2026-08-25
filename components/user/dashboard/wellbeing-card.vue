<script setup lang="ts">
import type { ICheckInSummary } from '~/interfaces/checkin/check-in.interface'

const props = defineProps<{
  summary: ICheckInSummary | null
}>()

const average = computed(() => props.summary?.average ?? 0)

const delta = computed(() => {
  if (!props.summary) return 0
  return Math.round((props.summary.average - props.summary.previousAverage) * 10) / 10
})

const deltaLabel = computed(() => {
  if (!props.summary || props.summary.previousAverage === 0) {
    return 'Registra tu ánimo para ver tu tendencia.'
  }
  if (delta.value > 0) return `Subió ${delta.value} desde la semana pasada.`
  if (delta.value < 0) return `Bajó ${Math.abs(delta.value)} desde la semana pasada.`
  return 'Se mantuvo igual que la semana pasada.'
})

const bars = computed(() => {
  const trend = props.summary?.trend ?? []
  return trend.map((day) => ({
    key: day.day,
    heightPercent: day.score ? Math.max(12, (day.score / 5) * 100) : 8,
    hasScore: day.score !== null,
  }))
})
</script>

<template>
  <div class="wellbeing-card">
    <span class="wellbeing-card__title">Tu bienestar</span>
    <div class="wellbeing-card__score">
      <span class="wellbeing-card__number">{{ average.toFixed(1) }}</span>
      <span class="wellbeing-card__max">/ 5.0</span>
    </div>
    <span class="wellbeing-card__delta">{{ deltaLabel }}</span>
    <div class="wellbeing-card__bars">
      <span
        v-for="bar in bars"
        :key="bar.key"
        class="wellbeing-card__bar"
        :class="{ 'wellbeing-card__bar--empty': !bar.hasScore }"
        :style="{ height: bar.heightPercent + '%' }"
      />
    </div>
  </div>
</template>

<style scoped>
.wellbeing-card {
  background: #065c5d;
  color: #fff;
  border-radius: 24px;
  padding: 22px;
}

.wellbeing-card__title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9fd7d8;
}

.wellbeing-card__score {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin: 10px 0 4px;
}

.wellbeing-card__number {
  font-size: 44px;
  font-weight: 800;
  line-height: 1;
}

.wellbeing-card__max {
  font-size: 15px;
  color: #bfe4e4;
  padding-bottom: 6px;
}

.wellbeing-card__delta {
  display: block;
  font-size: 13px;
  color: #c7e9ea;
}

.wellbeing-card__bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 74px;
  margin-top: 18px;
}

.wellbeing-card__bar {
  flex: 1;
  background: #6cc5cb;
  border-radius: 8px;
  transition: height 0.2s ease;
}

.wellbeing-card__bar--empty {
  background: #0b7273;
}
</style>
