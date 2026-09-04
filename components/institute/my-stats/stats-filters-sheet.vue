<script setup lang="ts">
import type {
  IStatsFilterOptions,
  IStatsFilters,
  IStatsPopulation,
  IStatsPrivacy,
} from '~/interfaces/stats/institute-stats.interface'
import { genderLabels } from '~/utils/translations'
import { AGE_RANGE_OPTIONS, PERIOD_OPTIONS } from './stats-config'

const props = defineProps<{
  modelValue: boolean
  filters: IStatsFilters
  options: IStatsFilterOptions
  population: IStatsPopulation
  privacy: IStatsPrivacy
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'apply', value: IStatsFilters): void
  (event: 'clear'): void
}>()

/**
 * En móvil los filtros no se aplican al tocarlos: se acumulan en un borrador y
 * se mandan con "Aplicar". Cada cambio dispara dos peticiones, y en una hoja
 * con cinco controles eso son cinco recargas que el usuario no pidió.
 */
const draft = ref<IStatsFilters>({ ...props.filters })

watch(
  () => props.modelValue,
  (open) => {
    if (open) draft.value = { ...props.filters }
  },
)

const formatNumber = (value: number) => value.toLocaleString('es-MX')

const genderLabel = (value: string) =>
  genderLabels[value] ?? genderLabels[value?.toLowerCase()] ?? value

const coverage = computed(() => props.population.coveragePct ?? 0)

const close = () => emit('update:modelValue', false)

function apply() {
  emit('apply', { ...draft.value })
  close()
}

function clearAndClose() {
  emit('clear')
  close()
}
</script>

<template>
  <v-bottom-sheet
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="sheet">
      <span class="sheet__grabber" />

      <header class="sheet__head">
        <h2 class="sheet__title">Filtrar población</h2>
        <button type="button" class="sheet__clear" @click="clearAndClose">
          Limpiar
        </button>
      </header>

      <div class="block">
        <span class="block__label">Periodo</span>
        <div class="periods">
          <button
            v-for="option in PERIOD_OPTIONS"
            :key="option.value"
            type="button"
            class="period"
            :class="{
              'period--active': draft.days === option.days,
              'period--all': option.days === null,
            }"
            @click="draft.days = option.days"
          >
            {{ option.days === null ? option.label : option.short }}
          </button>
        </div>
      </div>

      <div class="fields">
        <label class="field" :class="{ 'field--set': Boolean(draft.campus) }">
          <span class="field__body">
            <span class="field__label">Campus</span>
            <select
              v-model="draft.campus"
              class="field__select"
              :disabled="!options.campus.length"
            >
              <option :value="null">
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
          </span>
        </label>

        <label
          class="field"
          :class="{ 'field--set': Boolean(draft.department) }"
        >
          <span class="field__body">
            <span class="field__label">Facultad</span>
            <select
              v-model="draft.department"
              class="field__select"
              :disabled="!options.department.length"
            >
              <option :value="null">
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
          </span>
        </label>

        <label class="field" :class="{ 'field--set': Boolean(draft.ageRange) }">
          <span class="field__body">
            <span class="field__label">Edad</span>
            <select v-model="draft.ageRange" class="field__select">
              <option :value="null">Todas</option>
              <option
                v-for="option in AGE_RANGE_OPTIONS"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </span>
        </label>

        <label class="field" :class="{ 'field--set': Boolean(draft.gender) }">
          <span class="field__body">
            <span class="field__label">Género</span>
            <select
              v-model="draft.gender"
              class="field__select"
              :disabled="!options.gender.length"
            >
              <option :value="null">Todos</option>
              <option
                v-for="gender in options.gender"
                :key="gender"
                :value="gender"
              >
                {{ genderLabel(gender) }}
              </option>
            </select>
          </span>
        </label>
      </div>

      <div class="sample">
        <div class="sample__head">
          <span class="sample__count">
            <template v-if="population.totalStudents">
              {{ formatNumber(population.respondents) }} de
              {{ formatNumber(population.totalStudents) }} alumnos
            </template>
            <template v-else
              >{{ formatNumber(population.respondents) }} respuestas</template
            >
          </span>
          <span v-if="population.totalStudents" class="sample__percent"
            >{{ Math.round(coverage) }}%</span
          >
        </div>
        <span class="sample__bar">
          <span
            class="sample__fill"
            :style="{ width: `${Math.min(100, coverage)}%` }"
          />
        </span>
        <span class="sample__hint">
          Por debajo de {{ privacy.minGroupSize }} respuestas el cruce se
          bloquea para no identificar a nadie.
        </span>
      </div>

      <button type="button" class="apply" @click="apply">
        Aplicar filtros
      </button>
    </div>
  </v-bottom-sheet>
</template>

<style scoped>
.sheet {
  background: #fff;
  border-radius: 34px 34px 0 0;
  padding: 14px 20px 26px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  font-family: 'Figtree', sans-serif;
}

.sheet__grabber {
  width: 44px;
  height: 5px;
  border-radius: 999px;
  background: #e4dcf0;
  align-self: center;
}

.sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sheet__title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #3c2f52;
  margin: 0;
}

.sheet__clear {
  border: 0;
  background: transparent;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #8475a0;
  cursor: pointer;
}

.block {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.block__label {
  font-size: 13px;
  font-weight: 800;
  color: #4b3f60;
}

.periods {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.period--all {
  grid-column: 1 / -1;
}

.period {
  height: 46px;
  border: 2px solid #ece7f3;
  border-radius: 999px;
  background: #fff;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #4b3f60;
  cursor: pointer;
}

.period--active {
  border-color: #8475a0;
  background: #8475a0;
  color: #fff;
  font-weight: 800;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field {
  position: relative;
  height: 54px;
  border: 2px solid #ece7f3;
  border-radius: 999px;
  background: #faf9fc;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.field--set {
  border-color: #8475a0;
  background: #f7f4fa;
}

.field::after {
  content: '';
  position: absolute;
  right: 22px;
  width: 8px;
  height: 8px;
  border-right: 2.5px solid #6b6080;
  border-bottom: 2.5px solid #6b6080;
  transform: translateY(-2px) rotate(45deg);
  pointer-events: none;
}

.field__body {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
}

.field__label {
  font-size: 11px;
  font-weight: 700;
  color: #6b6080;
}

.field__select {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 0 24px 0 0;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #3c2f52;
  cursor: pointer;
  width: 100%;
  text-overflow: ellipsis;
}

.sample {
  background: #f7f4fa;
  border-radius: 20px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.sample__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.sample__count {
  font-size: 14px;
  font-weight: 800;
  color: #3c2f52;
}

.sample__percent {
  font-size: 14px;
  font-weight: 800;
  color: #8475a0;
}

.sample__bar {
  height: 9px;
  border-radius: 999px;
  background: #e9e3f2;
  display: flex;
  overflow: hidden;
}

.sample__fill {
  background: #8475a0;
}

.sample__hint {
  font-size: 12.5px;
  line-height: 1.5;
  color: #6b6080;
}

.apply {
  height: 52px;
  border: 0;
  border-radius: 999px;
  background: #8475a0;
  color: #fff;
  font-family: 'Figtree', sans-serif;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

.apply:hover {
  background: #6d5f88;
}
</style>
