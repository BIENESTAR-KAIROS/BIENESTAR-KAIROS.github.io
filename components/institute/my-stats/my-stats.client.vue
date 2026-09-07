<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type {
  IDimensionDetail,
  IStatsFilters,
} from '~/interfaces/stats/institute-stats.interface'
import { genderLabels } from '~/utils/translations'
import StatsFilters from './stats-filters.vue'
import StatsFiltersSheet from './stats-filters-sheet.vue'
import StatsSummary from './stats-summary.vue'
import StatsDistribution from './stats-distribution.vue'
import StatsDimensions from './stats-dimensions.vue'
import StatsMap from './stats-map.vue'
import StatsEmptyState from './stats-empty-state.vue'
import StatsDimensionDetail from './stats-dimension-detail.vue'
import {
  AGE_RANGE_OPTIONS,
  DEFAULT_PERIOD_DAYS,
  periodLabelFor,
} from './stats-config'
import { useMyStats } from './use-my-stats'

const { $router } = useNuxtApp()
const { mobile } = useDisplay()

const {
  filters,
  state,
  errorMessage,
  generatedAt,
  globals,
  population,
  privacy,
  filterOptions,
  distribution,
  bands,
  dimensions,
  zones,
  wellbeingDelta,
  respondentsDelta,
  widerPeriodCount,
  widerPeriod,
  savedViews,
  resultStats,
  load,
  applyFilters,
  clearFilters,
  removeFilter,
  dimensionDetail,
  exportCsv,
  loadSavedViews,
  saveView,
  deleteView,
  applySavedView,
} = useMyStats()

const isFilterSheetOpen = ref(false)
const openedDimension = ref<IDimensionDetail | null>(null)
const isExporting = ref(false)
const isSavingView = ref(false)
const saveViewName = ref('')
const isSaveViewOpen = ref(false)
const actionError = ref('')

const formatNumber = (value: number) => value.toLocaleString('es-MX')

const periodLabel = computed(() => periodLabelFor(filters.days))

const headerTitle = computed(() => {
  const count = formatNumber(globals.value.n)
  const answers = globals.value.n === 1 ? 'respuesta' : 'respuestas'

  // "en el histórico completo" no admite el "en los" que piden los demás.
  if (filters.days === null)
    return `${count} ${answers} en el histórico completo`

  return `${count} ${answers} en los ${periodLabel.value.toLowerCase()}`
})

/** "Actualizado hoy, 08:15" en vez de un ISO que nadie lee de un vistazo. */
const updatedLabel = computed(() => {
  if (!generatedAt.value) return null

  const value = new Date(generatedAt.value)
  if (Number.isNaN(value.getTime())) return null

  const time = value.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const startOfDay = (input: Date) =>
    new Date(input.getFullYear(), input.getMonth(), input.getDate()).getTime()
  const days = Math.round(
    (startOfDay(new Date()) - startOfDay(value)) / 86400000,
  )

  if (days === 0) return `Actualizado hoy, ${time}`
  if (days === 1) return `Actualizado ayer, ${time}`
  return `Actualizado el ${value.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`
})

const genderLabel = (value: string) =>
  genderLabels[value] ?? genderLabels[value?.toLowerCase()] ?? value

/** Los chips que resumen los cortes activos en el encabezado móvil. */
const mobileChips = computed(() => {
  const chips = [periodLabel.value.replace(/^Últimos? /, '')]
  if (filters.campus) chips.push(filters.campus)
  if (filters.department) chips.push(filters.department)
  if (filters.ageRange) {
    chips.push(
      AGE_RANGE_OPTIONS.find((option) => option.value === filters.ageRange)
        ?.label ?? filters.ageRange,
    )
  }
  if (filters.gender) chips.push(genderLabel(filters.gender))
  return chips
})

const activeCutCount = computed(
  () =>
    [
      filters.campus,
      filters.department,
      filters.ageRange,
      filters.gender,
    ].filter(Boolean).length + (filters.days === DEFAULT_PERIOD_DAYS ? 0 : 1),
)

const hasComparison = computed(
  () => resultStats.value !== null && resultStats.value.previous.n > 0,
)

function openDimension(key: string) {
  openedDimension.value = dimensionDetail(key)
}

function goToAttentionUsers() {
  $router.push('/institute/my-users?status=ATTENTION')
}

/**
 * El detalle propone filtrar por el grupo más bajo. Como el tablero no tiene
 * corte por año de estudio, se lleva al listado de personas, que sí lo tiene.
 */
function filterByGroup(group: string) {
  openedDimension.value = null
  $router.push(`/institute/my-users?studyYear=${encodeURIComponent(group)}`)
}

function remindPending() {
  $router.push('/institute/my-users?status=INACTIVE')
}

async function onExport() {
  actionError.value = ''
  isExporting.value = true
  try {
    await exportCsv()
  } catch (error) {
    console.error('Error exportando el CSV', error)
    actionError.value = 'No pudimos generar el CSV. Intenta de nuevo.'
  } finally {
    isExporting.value = false
  }
}

async function onSaveView() {
  const name = saveViewName.value.trim()
  if (!name) return

  actionError.value = ''
  isSavingView.value = true
  try {
    await saveView(name)
    saveViewName.value = ''
    isSaveViewOpen.value = false
  } catch (error) {
    console.error('Error guardando la vista', error)
    actionError.value = 'No pudimos guardar la vista. Intenta de nuevo.'
  } finally {
    isSavingView.value = false
  }
}

function onSheetApply(next: IStatsFilters) {
  applyFilters(next)
}

onMounted(() => {
  load()
  loadSavedViews()
})
</script>

<template>
  <div class="stats">
    <header class="stats__header">
      <div class="stats__heading">
        <span class="stats__eyebrow">Mis estadísticas</span>
        <span class="stats__title">{{ headerTitle }}</span>
      </div>

      <div class="stats__actions">
        <span v-if="updatedLabel" class="stats__updated">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3.5 2" />
          </svg>
          {{ updatedLabel }}
        </span>

        <button
          type="button"
          class="btn btn--ghost"
          :disabled="isExporting || state === 'loading'"
          @click="onExport"
        >
          {{ isExporting ? 'Generando…' : 'Exportar CSV' }}
        </button>

        <button
          type="button"
          class="btn btn--primary"
          :disabled="state === 'loading'"
          @click="isSaveViewOpen = true"
        >
          Guardar esta vista
        </button>
      </div>
    </header>

    <div v-if="savedViews.length" class="views">
      <span class="views__label">Vistas guardadas:</span>
      <span v-for="view in savedViews" :key="view.id" class="views__item">
        <button
          type="button"
          class="views__apply"
          @click="applySavedView(view)"
        >
          {{ view.name }}
        </button>
        <button
          type="button"
          class="views__delete"
          :aria-label="`Eliminar la vista ${view.name}`"
          @click="deleteView(view.id)"
        >
          ×
        </button>
      </span>
    </div>

    <p v-if="actionError" class="banner banner--error">{{ actionError }}</p>

    <!-- Barra de filtros móvil: la hoja inferior sustituye a los cinco selects. -->
    <div v-if="mobile" class="mobile-filters">
      <button
        type="button"
        class="mobile-filters__button"
        @click="isFilterSheetOpen = true"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 5h16M7 12h10M10 19h4" />
        </svg>
        Filtros<template v-if="activeCutCount">
          · {{ activeCutCount }}</template
        >
      </button>
      <span
        v-for="chip in mobileChips"
        :key="chip"
        class="mobile-filters__chip"
        >{{ chip }}</span
      >
    </div>

    <StatsFilters
      v-else
      :filters="filters"
      :options="filterOptions"
      :population="population"
      :privacy="privacy"
      @apply="applyFilters"
      @remove="removeFilter"
      @clear="clearFilters"
    />

    <p v-if="state === 'loading'" class="banner">Cargando tus estadísticas…</p>

    <p v-else-if="state === 'error'" class="banner banner--error">
      {{ errorMessage }}
    </p>

    <StatsEmptyState
      v-else-if="state === 'insufficient-sample' || state === 'first-period'"
      :variant="state"
      :filters="filters"
      :population="population"
      :privacy="privacy"
      :respondents="globals.n"
      :wider-period-count="widerPeriodCount"
      :wider-period="widerPeriod"
      @remove="removeFilter"
      @widen="applyFilters({ days: widerPeriod?.days ?? null })"
      @remind="remindPending"
    />

    <template v-else>
      <StatsSummary
        :globals="globals"
        :population="population"
        :dimensions="dimensions"
        :wellbeing-delta="wellbeingDelta"
        :respondents-delta="respondentsDelta"
      />

      <div class="panels">
        <StatsDistribution
          :distribution="distribution"
          :bands="bands"
          :total="globals.n"
          :compact="mobile"
          @see-attention="goToAttentionUsers"
        />

        <StatsDimensions
          :dimensions="dimensions"
          :has-comparison="hasComparison"
          :compact="mobile"
          @open="openDimension"
        />
      </div>

      <StatsMap :zones="zones" :privacy="privacy" :compact="mobile" />
    </template>

    <StatsFiltersSheet
      v-model="isFilterSheetOpen"
      :filters="filters"
      :options="filterOptions"
      :population="population"
      :privacy="privacy"
      @apply="onSheetApply"
      @clear="clearFilters"
    />

    <StatsDimensionDetail
      :detail="openedDimension"
      @close="openedDimension = null"
      @filter-group="filterByGroup"
    />

    <v-dialog v-model="isSaveViewOpen" max-width="480">
      <div class="dialog">
        <h2 class="dialog__title">Guardar esta vista</h2>
        <p class="dialog__subtitle">
          Se guardan los filtros, no los números: al volver verás cómo cambió
          esa población.
        </p>

        <label class="dialog__field">
          <span class="dialog__label">Nombre</span>
          <input
            v-model="saveViewName"
            class="dialog__input"
            type="text"
            maxlength="80"
            placeholder="Ingeniería · 90 días"
            @keyup.enter="onSaveView"
          />
        </label>

        <div class="dialog__actions">
          <button
            type="button"
            class="btn btn--ghost"
            @click="isSaveViewOpen = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn--primary"
            :disabled="isSavingView || !saveViewName.trim()"
            @click="onSaveView"
          >
            {{ isSavingView ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<style scoped>
.stats {
  min-height: 100%;
  background: #f5f4f8;
  padding: 24px 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  font-family: 'Figtree', sans-serif;
}

.stats__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.stats__heading {
  display: flex;
  flex-direction: column;
}

.stats__eyebrow {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b6080;
}

.stats__title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #3c2f52;
}

.stats__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.stats__updated {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  background: #f0eaf5;
  color: #5c4a75;
  font-size: 13px;
  font-weight: 700;
}

.btn {
  height: 42px;
  padding: 0 20px;
  border-radius: 999px;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--ghost {
  border: 2px solid #ded6ea;
  background: #fff;
  color: #3c2f52;
}

.btn--ghost:hover:not(:disabled) {
  border-color: #8475a0;
  color: #8475a0;
}

.btn--primary {
  border: 0;
  background: #8475a0;
  color: #fff;
}

.btn--primary:hover:not(:disabled) {
  background: #6d5f88;
}

.views {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.views__label {
  font-size: 13px;
  font-weight: 700;
  color: #6b6080;
}

.views__item {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 6px 0 0;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e6dff0;
}

.views__apply {
  border: 0;
  background: transparent;
  padding: 0 10px 0 14px;
  font-family: 'Figtree', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #4a3a63;
  cursor: pointer;
}

.views__delete {
  border: 0;
  background: transparent;
  color: #9a90ad;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 0 6px;
}

.banner {
  margin: 0;
  padding: 18px 22px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #efebf5;
  font-size: 14px;
  color: #6b6080;
}

.banner--error {
  color: #b3261e;
  border-color: #f3d8d5;
}

.mobile-filters {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.mobile-filters__button {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: #3c2f52;
  color: #fff;
  font-family: 'Figtree', sans-serif;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.mobile-filters__chip {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  background: #ece7f3;
  color: #4a3a63;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: stretch;
}

.dialog {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-family: 'Figtree', sans-serif;
}

.dialog__title {
  font-size: 19px;
  font-weight: 800;
  color: #3c2f52;
  margin: 0;
}

.dialog__subtitle {
  font-size: 14px;
  line-height: 1.55;
  color: #6b6080;
  margin: 0;
}

.dialog__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dialog__label {
  font-size: 13px;
  font-weight: 700;
  color: #4b3f60;
}

.dialog__input {
  height: 46px;
  padding: 0 16px;
  border: 2px solid #ece7f3;
  border-radius: 14px;
  background: #faf9fc;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  color: #3c2f52;
}

.dialog__input:focus {
  outline: none;
  border-color: #8475a0;
}

.dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 1100px) {
  .panels {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .stats {
    padding: 20px 20px 32px;
    gap: 16px;
  }

  .stats__header {
    align-items: flex-start;
  }

  .stats__actions {
    width: 100%;
  }

  .stats__updated {
    order: 3;
  }

  .btn {
    flex: 1;
    min-width: 140px;
  }
}
</style>
