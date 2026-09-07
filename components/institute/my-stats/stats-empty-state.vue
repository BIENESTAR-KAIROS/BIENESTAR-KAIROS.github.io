<script setup lang="ts">
import type {
  IStatsFilters,
  IStatsPopulation,
  IStatsPrivacy,
} from '~/interfaces/stats/institute-stats.interface'
import { genderLabels } from '~/utils/translations'
import {
  AGE_RANGE_OPTIONS,
  DEFAULT_PERIOD_DAYS,
  MIN_COVERAGE_TO_OPEN_PCT,
  periodLabelFor,
} from './stats-config'

const props = defineProps<{
  /**
   * `insufficient-sample`: el cruce dejó a menos gente que el piso de anonimato.
   * `first-period`: todavía no hay población que leer, con filtros o sin ellos.
   */
  variant: 'insufficient-sample' | 'first-period'
  filters: IStatsFilters
  population: IStatsPopulation
  privacy: IStatsPrivacy
  respondents: number
  /** Cuántas respuestas quedarían en el periodo propuesto. */
  widerPeriodCount: number | null
  /** El siguiente periodo más largo; null si ya se está en el histórico. */
  widerPeriod: { days: number | null; label: string } | null
}>()

const emit = defineEmits<{
  (event: 'remove', value: keyof IStatsFilters): void
  (event: 'widen'): void
  (event: 'remind'): void
}>()

const formatNumber = (value: number) => value.toLocaleString('es-MX')

const genderLabel = (value: string) =>
  genderLabels[value] ?? genderLabels[value?.toLowerCase()] ?? value

/** Solo los cortes que el usuario puede quitar para salir del estado. */
const activeChips = computed(() => {
  const chips: Array<{ key: keyof IStatsFilters; label: string }> = []

  if (props.filters.days !== DEFAULT_PERIOD_DAYS) {
    chips.push({ key: 'days', label: periodLabelFor(props.filters.days) })
  }
  if (props.filters.campus)
    chips.push({ key: 'campus', label: props.filters.campus })
  if (props.filters.department)
    chips.push({ key: 'department', label: props.filters.department })
  if (props.filters.ageRange) {
    chips.push({
      key: 'ageRange',
      label:
        AGE_RANGE_OPTIONS.find(
          (option) => option.value === props.filters.ageRange,
        )?.label ?? props.filters.ageRange,
    })
  }
  if (props.filters.gender)
    chips.push({ key: 'gender', label: genderLabel(props.filters.gender) })

  return chips
})

/**
 * Meta de respuestas para abrir el tablero. Se expresa en respuestas y no en
 * porcentaje porque es lo que la institución puede ir contando.
 */
const target = computed(() => {
  const total = props.population.totalStudents
  if (!total) return null
  return Math.max(
    props.privacy.minGroupSize,
    Math.ceil((total * MIN_COVERAGE_TO_OPEN_PCT) / 100),
  )
})

const progress = computed(() => {
  if (!target.value) return 0
  return Math.min(100, Math.round((props.respondents / target.value) * 100))
})

const canWiden = computed(
  () => props.widerPeriod !== null && props.widerPeriodCount !== null,
)

/** "Ampliar a últimos 3 meses" en vez de "a 90 días": la etiqueta del catálogo. */
const widenLabel = computed(() =>
  (props.widerPeriod?.label ?? '').replace(/^Últimos? /, '').toLowerCase(),
)
</script>

<template>
  <section class="state">
    <template v-if="variant === 'insufficient-sample'">
      <span class="state__eyebrow">Muestra insuficiente</span>

      <div class="card">
        <span class="icon icon--warn">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c77a1f"
            stroke-width="2.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="4" y="10" width="16" height="11" rx="3" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </span>

        <h2 class="card__title">
          Este cruce deja {{ formatNumber(respondents) }}
          {{ respondents === 1 ? 'respuesta' : 'respuestas' }}
        </h2>

        <p class="card__text">
          Con menos de {{ privacy.minGroupSize }} personas los resultados
          dejarían de ser anónimos, así que no los mostramos. Quita un filtro o
          amplía el periodo.
        </p>

        <div v-if="activeChips.length" class="chips">
          <span v-for="chip in activeChips" :key="chip.key" class="chip">
            {{ chip.label }}
            <button
              type="button"
              class="chip__remove"
              :aria-label="`Quitar filtro ${chip.label}`"
              @click="emit('remove', chip.key)"
            >
              ×
            </button>
          </span>
        </div>

        <button
          v-if="canWiden"
          type="button"
          class="button button--primary"
          @click="emit('widen')"
        >
          {{
            widerPeriod?.days === null
              ? 'Ver el histórico completo'
              : `Ampliar a ${widenLabel}`
          }}
          · {{ formatNumber(widerPeriodCount as number) }}
          {{ widerPeriodCount === 1 ? 'respuesta' : 'respuestas' }}
        </button>
      </div>
    </template>

    <template v-else>
      <span class="state__eyebrow">Primer periodo</span>

      <div class="card">
        <span class="icon icon--neutral">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8475a0"
            stroke-width="2.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 20V10M10 20V4M16 20v-7M22 20v-11" />
          </svg>
        </span>

        <h2 class="card__title">Aún no hay suficientes respuestas</h2>

        <p class="card__text">
          <template v-if="population.totalStudents">
            Han respondido {{ formatNumber(respondents) }} de tus
            {{ formatNumber(population.totalStudents) }} alumnos. Las
            estadísticas se abren al llegar al {{ MIN_COVERAGE_TO_OPEN_PCT }}%.
          </template>
          <template v-else>
            Llevas {{ formatNumber(respondents) }}
            {{ respondents === 1 ? 'respuesta' : 'respuestas' }} en este
            periodo. Las estadísticas se abren al reunir al menos
            {{ privacy.minGroupSize }}, que es el mínimo para que sigan siendo
            anónimas.
          </template>
        </p>

        <div v-if="target" class="progress">
          <div class="progress__head">
            <span class="progress__count">
              {{ formatNumber(respondents) }} de
              {{ formatNumber(target) }} respuestas
            </span>
            <span class="progress__percent">{{ progress }}%</span>
          </div>
          <span class="progress__bar">
            <span class="progress__fill" :style="{ width: `${progress}%` }" />
          </span>
        </div>

        <button
          type="button"
          class="button button--ghost"
          @click="emit('remind')"
        >
          Recordar a quienes faltan
        </button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.state {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 460px;
}

.state__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6b6080;
}

.card {
  background: #fff;
  border: 1px solid #efebf5;
  border-radius: 20px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.icon {
  width: 46px;
  height: 46px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon--warn {
  background: #fbf3e8;
}

.icon--neutral {
  background: #f0eaf5;
}

.card__title {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #3c2f52;
  margin: 0;
}

.card__text {
  font-size: 14px;
  line-height: 1.6;
  color: #4b3f60;
  margin: 0;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: #f0eaf5;
  color: #4a3a63;
  font-size: 13px;
  font-weight: 700;
}

.chip__remove {
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 17px;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
}

.progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.progress__count {
  font-size: 13px;
  font-weight: 700;
  color: #4b3f60;
}

.progress__percent {
  font-size: 13px;
  font-weight: 800;
  color: #8475a0;
}

.progress__bar {
  height: 10px;
  border-radius: 999px;
  background: #f0edf5;
  display: flex;
  overflow: hidden;
}

.progress__fill {
  background: #8475a0;
  transition: width 0.25s ease;
}

.button {
  height: 44px;
  border-radius: 999px;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.button--primary {
  border: 0;
  background: #8475a0;
  color: #fff;
}

.button--primary:hover {
  background: #6d5f88;
}

.button--ghost {
  border: 2px solid #ded6ea;
  background: #fff;
  color: #3c2f52;
}

.button--ghost:hover {
  border-color: #8475a0;
  color: #8475a0;
}
</style>
