<script setup lang="ts">
import type {
  IStatsFilterOptions,
  IStatsFilters,
  IStatsPopulation,
  IStatsPrivacy,
} from '~/interfaces/stats/institute-stats.interface'
import { genderLabels } from '~/utils/translations'
import {
  AGE_RANGE_OPTIONS,
  DEFAULT_PERIOD_DAYS,
  PERIOD_OPTIONS,
  REPRESENTATIVE_COVERAGE_PCT,
  periodByDays,
  periodLabelFor,
} from './stats-config'

const props = defineProps<{
  filters: IStatsFilters
  options: IStatsFilterOptions
  population: IStatsPopulation
  privacy: IStatsPrivacy
}>()

const emit = defineEmits<{
  (event: 'apply', value: Partial<IStatsFilters>): void
  (event: 'remove', value: keyof IStatsFilters): void
  (event: 'clear'): void
}>()

const formatNumber = (value: number) => value.toLocaleString('es-MX')

const coverage = computed(() => props.population.coveragePct ?? 0)

const coverageLabel = computed(() => {
  const { respondents, totalStudents } = props.population
  if (!totalStudents) return `${formatNumber(respondents)} respuestas`
  return `${formatNumber(respondents)} de ${formatNumber(totalStudents)} alumnos · ${Math.round(coverage.value)}%`
})

/**
 * El pie del bloque de muestra dice si lo de abajo se puede leer como
 * población o si todavía es un puñado de respuestas.
 */
const coverageHint = computed(() => {
  if (!props.privacy.sampleSufficient) {
    return `Por debajo de ${props.privacy.minGroupSize} respuestas el cruce se bloquea`
  }
  if (!props.population.totalStudents) return 'Muestra del periodo'
  return coverage.value >= REPRESENTATIVE_COVERAGE_PCT
    ? 'Muestra suficiente para publicar'
    : 'Muestra baja: léela con reservas'
})

const genderLabel = (value: string) =>
  genderLabels[value] ?? genderLabels[value?.toLowerCase()] ?? value

const ageLabel = (value: string | null) =>
  AGE_RANGE_OPTIONS.find((option) => option.value === value)?.label ?? value

/** Chips de lo aplicado. El periodo siempre está puesto, así que siempre sale. */
const appliedChips = computed(() => {
  const chips: Array<{
    key: keyof IStatsFilters
    label: string
    removable: boolean
  }> = [
    {
      key: 'days',
      label: periodLabelFor(props.filters.days),
      removable: props.filters.days !== DEFAULT_PERIOD_DAYS,
    },
  ]

  if (props.filters.campus)
    chips.push({ key: 'campus', label: props.filters.campus, removable: true })
  if (props.filters.department)
    chips.push({
      key: 'department',
      label: props.filters.department,
      removable: true,
    })
  if (props.filters.ageRange)
    chips.push({
      key: 'ageRange',
      label: ageLabel(props.filters.ageRange) as string,
      removable: true,
    })
  if (props.filters.gender)
    chips.push({
      key: 'gender',
      label: genderLabel(props.filters.gender),
      removable: true,
    })

  return chips
})

const canClear = computed(() =>
  appliedChips.value.some((chip) => chip.removable),
)

const isSet = (value: string | null) => Boolean(value)

function onPeriodChange(value: string) {
  const option = PERIOD_OPTIONS.find((entry) => entry.value === value)
  if (option) emit('apply', { days: option.days })
}
</script>

<template>
  <section class="filters">
    <header class="filters__head">
      <div class="filters__intro">
        <h2 class="filters__title">Filtra tu población</h2>
        <p class="filters__subtitle">
          Cada filtro recalcula todo lo de abajo. La muestra resultante siempre
          se muestra a la derecha.
        </p>
      </div>

      <div class="sample">
        <span class="sample__count">{{ coverageLabel }}</span>
        <span class="sample__bar">
          <span
            class="sample__bar-fill"
            :style="{ width: `${Math.min(100, coverage)}%` }"
          />
        </span>
        <span class="sample__hint">{{ coverageHint }}</span>
      </div>
    </header>

    <div class="grid">
      <label class="field">
        <span class="field__label">Periodo</span>
        <div class="field__control field__control--set">
          <select
            class="field__select"
            :value="periodByDays(filters.days)?.value ?? 'all'"
            @change="onPeriodChange(($event.target as HTMLSelectElement).value)"
          >
            <option
              v-for="option in PERIOD_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </label>

      <label class="field">
        <span class="field__label">Campus</span>
        <div
          class="field__control"
          :class="{ 'field__control--set': isSet(filters.campus) }"
        >
          <select
            class="field__select"
            :value="filters.campus ?? ''"
            :disabled="!options.campus.length"
            @change="
              emit('apply', {
                campus: ($event.target as HTMLSelectElement).value || null,
              })
            "
          >
            <option value="">
              Todos{{
                options.campus.length ? ` (${options.campus.length})` : ''
              }}
            </option>
            <option
              v-for="campus in options.campus"
              :key="campus"
              :value="campus"
            >
              {{ campus }}
            </option>
          </select>
        </div>
      </label>

      <label class="field">
        <span class="field__label">Facultad</span>
        <div
          class="field__control"
          :class="{ 'field__control--set': isSet(filters.department) }"
        >
          <select
            class="field__select"
            :value="filters.department ?? ''"
            :disabled="!options.department.length"
            @change="
              emit('apply', {
                department: ($event.target as HTMLSelectElement).value || null,
              })
            "
          >
            <option value="">
              Todas{{
                options.department.length
                  ? ` (${options.department.length})`
                  : ''
              }}
            </option>
            <option
              v-for="department in options.department"
              :key="department"
              :value="department"
            >
              {{ department }}
            </option>
          </select>
        </div>
      </label>

      <label class="field">
        <span class="field__label">Edad</span>
        <div
          class="field__control"
          :class="{ 'field__control--set': isSet(filters.ageRange) }"
        >
          <select
            class="field__select"
            :value="filters.ageRange ?? ''"
            @change="
              emit('apply', {
                ageRange: ($event.target as HTMLSelectElement).value || null,
              })
            "
          >
            <option value="">Todas</option>
            <option
              v-for="option in AGE_RANGE_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </label>

      <label class="field">
        <span class="field__label">Género</span>
        <div
          class="field__control"
          :class="{ 'field__control--set': isSet(filters.gender) }"
        >
          <select
            class="field__select"
            :value="filters.gender ?? ''"
            :disabled="!options.gender.length"
            @change="
              emit('apply', {
                gender: ($event.target as HTMLSelectElement).value || null,
              })
            "
          >
            <option value="">Todos</option>
            <option
              v-for="gender in options.gender"
              :key="gender"
              :value="gender"
            >
              {{ genderLabel(gender) }}
            </option>
          </select>
        </div>
      </label>
    </div>

    <footer class="applied">
      <span class="applied__label">Aplicados:</span>

      <span v-for="chip in appliedChips" :key="chip.key" class="applied__chip">
        {{ chip.label }}
        <button
          v-if="chip.removable"
          type="button"
          class="applied__remove"
          :aria-label="`Quitar filtro ${chip.label}`"
          @click="emit('remove', chip.key)"
        >
          ×
        </button>
      </span>

      <button
        v-if="canClear"
        type="button"
        class="applied__clear"
        @click="emit('clear')"
      >
        Limpiar filtros
      </button>

      <span class="applied__privacy">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8475a0"
          stroke-width="2.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 3l8 3v6c0 5-3.5 8.2-8 9-4.5-.8-8-4-8-9V6z" />
        </svg>
        Los cruces que dejen menos de {{ privacy.minGroupSize }} respuestas se
        bloquean
      </span>
    </footer>
  </section>
</template>

<style scoped>
.filters {
  background: #fff;
  border: 1px solid #efebf5;
  border-radius: 24px;
  padding: 22px 26px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.filters__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.filters__intro {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filters__title {
  font-size: 18px;
  font-weight: 800;
  color: #3c2f52;
  margin: 0;
}

.filters__subtitle {
  font-size: 14px;
  color: #4b3f60;
  margin: 0;
}

.sample {
  flex: 0 0 260px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 7px;
}

.sample__count {
  font-size: 14px;
  font-weight: 800;
  color: #3c2f52;
}

.sample__bar {
  width: 260px;
  max-width: 100%;
  height: 9px;
  border-radius: 999px;
  background: #f0edf5;
  display: flex;
  overflow: hidden;
}

.sample__bar-fill {
  background: #8475a0;
  transition: width 0.25s ease;
}

.sample__hint {
  font-size: 12px;
  color: #6b6080;
}

.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.field__label {
  font-size: 13px;
  font-weight: 700;
  color: #4b3f60;
}

.field__control {
  position: relative;
  height: 50px;
  border-radius: 999px;
  border: 2px solid #ece7f3;
  background: #faf9fc;
  display: flex;
  align-items: center;
}

.field__control--set {
  border-color: #8475a0;
  background: #f7f4fa;
}

/* La flecha se dibuja con el borde del pseudo-elemento para no cargar un icono
   por cada filtro; el select nativo queda encima y conserva su accesibilidad. */
.field__control::after {
  content: '';
  position: absolute;
  right: 20px;
  width: 8px;
  height: 8px;
  border-right: 2.5px solid #6b6080;
  border-bottom: 2.5px solid #6b6080;
  transform: translateY(-2px) rotate(45deg);
  pointer-events: none;
}

.field__select {
  appearance: none;
  width: 100%;
  height: 100%;
  padding: 0 42px 0 18px;
  border: 0;
  background: transparent;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #3c2f52;
  cursor: pointer;
  text-overflow: ellipsis;
}

.field__select:disabled {
  cursor: not-allowed;
  color: #9a90ad;
}

.applied {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 2px;
}

.applied__label {
  font-size: 13px;
  font-weight: 700;
  color: #6b6080;
}

.applied__chip {
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

.applied__remove {
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 17px;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
}

.applied__clear {
  border: 0;
  background: transparent;
  font-family: 'Figtree', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #8475a0;
  cursor: pointer;
}

.applied__privacy {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  color: #6b6080;
}

@media (max-width: 1100px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters__head {
    flex-direction: column;
  }

  .sample {
    flex: 1 1 auto;
    width: 100%;
    align-items: flex-start;
  }

  .applied__privacy {
    margin-left: 0;
  }
}
</style>
