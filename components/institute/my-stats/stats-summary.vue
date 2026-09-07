<script setup lang="ts">
import type {
  IStatsDimension,
  IStatsGlobals,
  IStatsPopulation,
} from '~/interfaces/stats/institute-stats.interface'
import {
  REPRESENTATIVE_COVERAGE_PCT,
  SCORE_MAX,
  SCORE_MIN,
  WELLBEING_MAX,
} from './stats-config'

const props = defineProps<{
  globals: IStatsGlobals
  population: IStatsPopulation
  dimensions: IStatsDimension[]
  wellbeingDelta: number | null
  respondentsDelta: number | null
}>()

const formatNumber = (value: number) => value.toLocaleString('es-MX')

const signed = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value)}`

const wellbeingPct = computed(() =>
  props.globals.wellbeing
    ? Math.min(100, (props.globals.wellbeing / WELLBEING_MAX) * 100)
    : 0,
)

/** La dimensión más baja es la que explica el promedio general. */
const lowestDimension = computed(() => props.dimensions[0] ?? null)

const wellbeingReading = computed(() => {
  const score = props.globals.wellbeing
  if (score === null)
    return 'Aún no hay respuestas suficientes para leer el promedio.'

  const band = score >= 3.5 ? 'media-alta' : score >= 2.5 ? 'media' : 'baja'
  const trend =
    props.wellbeingDelta === null
      ? 'Es el primer periodo, así que todavía no hay con qué compararlo.'
      : props.wellbeingDelta > 0
        ? 'y subió respecto al periodo pasado.'
        : props.wellbeingDelta < 0
          ? 'y bajó respecto al periodo pasado.'
          : 'y quedó igual que el periodo pasado.'

  return `Tu población está en la franja ${band} ${trend}`
})

/**
 * "Qué tan parejo" traduce la desviación estándar. El número solo no dice nada
 * a quien lee el tablero; lo que importa es si la población es un bloque o dos
 * grupos opuestos.
 */
const spreadReading = computed(() => {
  const std = props.globals.std
  if (std === null) return '—'
  if (std < 15)
    return 'Población homogénea: la mayoría se agrupa cerca del promedio, sin dos grupos opuestos.'
  if (std < 25)
    return 'Dispersión moderada: hay diferencias claras entre grupos dentro de tu población.'
  return 'Población polarizada: conviven perfiles muy distintos, y el promedio esconde a los extremos.'
})

const coverageReading = computed(() => {
  const { totalStudents, coveragePct } = props.population
  if (!totalStudents || coveragePct === null)
    return 'Respuestas del periodo seleccionado.'

  const enough = coveragePct >= REPRESENTATIVE_COVERAGE_PCT
  return `${Math.round(coveragePct)}% de tus ${formatNumber(totalStudents)} alumnos. ${
    enough
      ? `Arriba del ${REPRESENTATIVE_COVERAGE_PCT}% que hace representativa la lectura.`
      : `Abajo del ${REPRESENTATIVE_COVERAGE_PCT}% que haría representativa la lectura.`
  }`
})

const rangeLabel = computed(() =>
  props.globals.min === null || props.globals.max === null
    ? '—'
    : `${props.globals.min} – ${props.globals.max}`,
)

/** Posición del rango observado dentro de la escala completa del instrumento. */
const rangeBar = computed(() => {
  const { min, max } = props.globals
  if (min === null || max === null) return { offset: 0, width: 0 }

  const span = SCORE_MAX - SCORE_MIN
  return {
    offset: ((min - SCORE_MIN) / span) * 100,
    width: ((max - min) / span) * 100,
  }
})
</script>

<template>
  <section class="summary">
    <header class="summary__head">
      <h2 class="summary__title">Resumen del periodo</h2>
      <span class="summary__note">
        {{
          wellbeingDelta === null
            ? 'Primer periodo con datos'
            : 'Comparado contra el periodo anterior'
        }}
      </span>
    </header>

    <div class="summary__grid">
      <article class="card card--hero">
        <span class="card--hero__eyebrow">Bienestar promedio</span>

        <div class="hero__value">
          <span class="hero__number">{{ globals.wellbeing ?? '—' }}</span>
          <span class="hero__scale">de {{ WELLBEING_MAX }}</span>
          <span
            v-if="wellbeingDelta !== null"
            class="hero__delta"
            :class="{ 'hero__delta--down': wellbeingDelta < 0 }"
          >
            {{ signed(wellbeingDelta) }}
          </span>
        </div>

        <span class="hero__bar">
          <span class="hero__bar-fill" :style="{ width: `${wellbeingPct}%` }" />
        </span>

        <p class="hero__reading">
          {{ wellbeingReading }}
          <template v-if="lowestDimension">
            Lo que arrastra el promedio hacia abajo es
            <strong>{{ lowestDimension.label.toLowerCase() }}</strong
            >, la dimensión más baja de las cinco.
          </template>
        </p>
      </article>

      <article class="card">
        <span class="card__label">Respondentes</span>
        <span class="card__value">{{ formatNumber(globals.n) }}</span>
        <span
          v-if="respondentsDelta !== null"
          class="card__delta"
          :class="{ 'card__delta--down': respondentsDelta < 0 }"
        >
          {{ signed(respondentsDelta) }} vs. periodo anterior
        </span>
        <span class="card__reading">{{ coverageReading }}</span>
      </article>

      <article class="card">
        <span class="card__label">Qué tan parejo</span>
        <span class="card__value">{{ globals.std ?? '—' }}</span>
        <span class="card__unit">puntos de desviación estándar</span>
        <span class="card__reading">{{ spreadReading }}</span>
      </article>

      <article class="card">
        <span class="card__label">Rango observado</span>
        <span class="card__value">{{ rangeLabel }}</span>
        <span class="card__unit"
          >score total · escala {{ SCORE_MIN }} a {{ SCORE_MAX }}</span
        >

        <div class="range">
          <span class="range__track">
            <span
              class="range__fill"
              :style="{
                marginLeft: `${rangeBar.offset}%`,
                width: `${rangeBar.width}%`,
              }"
            />
          </span>
          <div class="range__labels">
            <span>{{ SCORE_MIN }}</span>
            <span>{{ SCORE_MAX }}</span>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.summary {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary__head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.summary__title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #3c2f52;
  margin: 0;
}

.summary__note {
  font-size: 14px;
  color: #6b6080;
}

.summary__grid {
  display: grid;
  grid-template-columns: 1.35fr 1fr 1fr 1fr;
  gap: 16px;
}

.card {
  background: #fff;
  border: 1px solid #efebf5;
  border-radius: 24px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card--hero {
  background: #3c2f52;
  border-color: #3c2f52;
  color: #fff;
  padding: 26px;
  gap: 14px;
}

.card--hero__eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c3b6d6;
}

.hero__value {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.hero__number {
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
}

.hero__scale {
  font-size: 16px;
  font-weight: 600;
  color: #c3b6d6;
  padding-bottom: 8px;
}

.hero__delta {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: #4e3f68;
  color: #c9e8dd;
  font-size: 14px;
  font-weight: 800;
}

.hero__delta--down {
  color: #f0cba0;
}

.hero__bar {
  height: 10px;
  border-radius: 999px;
  background: #4e3f68;
  display: flex;
  overflow: hidden;
}

.hero__bar-fill {
  background: #b3a3cc;
  transition: width 0.25s ease;
}

.hero__reading {
  font-size: 14px;
  line-height: 1.55;
  color: #e0d8ec;
  margin: 0;
}

.hero__reading strong {
  color: #fff;
}

.card__label {
  font-size: 14px;
  font-weight: 700;
  color: #4b3f60;
}

.card__value {
  font-size: 38px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
  color: #3c2f52;
}

.card__unit {
  font-size: 13px;
  font-weight: 700;
  color: #6b6080;
}

.card__delta {
  font-size: 13px;
  font-weight: 800;
  color: #3f8f7e;
}

.card__delta--down {
  color: #8a5a15;
}

.card__reading {
  margin-top: auto;
  font-size: 13px;
  line-height: 1.5;
  color: #6b6080;
}

.range {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.range__track {
  height: 8px;
  border-radius: 999px;
  background: #f0edf5;
  display: flex;
  overflow: hidden;
}

.range__fill {
  background: #8475a0;
  border-radius: 999px;
}

.range__labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  color: #9a90ad;
}

@media (max-width: 1280px) {
  .summary__grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 700px) {
  .summary__grid {
    grid-template-columns: 1fr;
  }

  .hero__number {
    font-size: 46px;
  }

  .card--hero {
    padding: 20px;
  }
}
</style>
