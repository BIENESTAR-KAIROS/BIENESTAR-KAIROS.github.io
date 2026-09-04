<script setup lang="ts">
import type {
  IStatsPrivacy,
  IStatsZone,
} from '~/interfaces/stats/institute-stats.interface'

const props = defineProps<{
  zones: IStatsZone[]
  privacy: IStatsPrivacy
  /** En 390px un mapa de calor no se lee, pero el orden de los CP sí. */
  compact?: boolean
}>()

type MapView = 'heat' | 'list'

const view = ref<MapView>(props.compact ? 'list' : 'heat')

const map = ref<{ leafletObject?: any } | null>(null)
const heatLayer = ref<any>(null)

const scoreRange = computed(() => {
  if (!props.zones.length) return { min: 0, max: 0 }
  const means = props.zones.map((zone) => zone.mean)
  return { min: Math.min(...means), max: Math.max(...means) }
})

/** Encuadre alrededor de los CP con datos; CDMX si todavía no hay ninguno. */
const bounds = computed<[[number, number], [number, number]]>(() => {
  if (!props.zones.length) {
    return [
      [19.2, -99.3],
      [19.6, -99.0],
    ]
  }

  const lats = props.zones.map((zone) => zone.lat)
  const lngs = props.zones.map((zone) => zone.lng)

  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ]
})

const weight = (mean: number) => {
  const { min, max } = scoreRange.value
  return Math.max(0.05, Math.min(1, (mean - min) / Math.max(max - min, 1)))
}

/** Las zonas que piden atención primero: el listado se lee de peor a mejor. */
const rankedZones = computed(() =>
  [...props.zones].sort((a, b) => a.mean - b.mean),
)

const zoneTone = (mean: number) => {
  const { min, max } = scoreRange.value
  const t = (mean - min) / Math.max(max - min, 1)
  if (t <= 0.25) return 'low'
  if (t <= 0.5) return 'mid-low'
  if (t <= 0.75) return 'mid'
  return 'high'
}

async function drawHeatLayer() {
  const leafletObject = map.value?.leafletObject
  if (!leafletObject || !props.zones.length) return

  leafletObject.invalidateSize()

  if (heatLayer.value) leafletObject.removeLayer(heatLayer.value)

  const heatPoints = props.zones
    .filter((zone) => Number.isFinite(zone.lat) && Number.isFinite(zone.lng))
    .map((zone) => ({
      lat: zone.lat,
      lng: zone.lng,
      intensity: weight(zone.mean),
    }))

  if (!heatPoints.length) return

  try {
    heatLayer.value = await useLHeat({ leafletObject, heatPoints, radius: 30 })
  } catch (error) {
    console.error('No se pudo dibujar el mapa de calor', error)
  }
}

watch(() => props.zones, drawHeatLayer, { deep: true })
watch(view, (value) => {
  if (value === 'heat') nextTick(drawHeatLayer)
})
</script>

<template>
  <section class="panel">
    <header class="panel__head">
      <div class="panel__intro">
        <h2 class="panel__title">
          {{
            compact
              ? 'Zonas que piden atención'
              : 'Bienestar por código postal · CDMX'
          }}
        </h2>
        <p v-if="!compact" class="panel__subtitle">
          Sirve para saber dónde vive la población que peor está, no para
          señalar personas: un CP entra al mapa solo con
          {{ privacy.minGroupSize }} respuestas o más.
        </p>
      </div>

      <div v-if="!compact" class="toggle">
        <button
          type="button"
          class="toggle__option"
          :class="{ 'toggle__option--active': view === 'heat' }"
          @click="view = 'heat'"
        >
          Mapa de calor
        </button>
        <button
          type="button"
          class="toggle__option"
          :class="{ 'toggle__option--active': view === 'list' }"
          @click="view = 'list'"
        >
          Lista
        </button>
      </div>
    </header>

    <p v-if="!zones.length" class="empty">
      Ningún código postal llegó a {{ privacy.minGroupSize }} respuestas en este
      periodo, así que el mapa queda vacío. Las respuestas siguen contando en
      los promedios de arriba.
    </p>

    <div v-else class="body" :class="{ 'body--compact': compact }">
      <div v-if="!compact && view === 'heat'" class="map">
        <LMap
          ref="map"
          :zoom="12"
          :center="[19.32, -99.15]"
          :use-global-leaflet="true"
          :bounds="bounds"
          @ready="drawHeatLayer"
        >
          <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap © CARTO"
            layer-type="base"
            name="OpenStreetMap"
          />
        </LMap>
      </div>

      <div v-else-if="!compact" class="table">
        <div class="table__head">
          <span>Código postal</span>
          <span>Colonia</span>
          <span class="table__num">Score</span>
          <span class="table__num">Respuestas</span>
        </div>
        <div v-for="zone in rankedZones" :key="zone.cp" class="table__row">
          <span class="table__cp">{{ zone.cp }}</span>
          <span>{{ zone.place }}</span>
          <span
            class="table__num table__score"
            :class="`table__score--${zoneTone(zone.mean)}`"
          >
            {{ zone.mean }}
          </span>
          <span class="table__num">{{ zone.n }}</span>
        </div>
      </div>

      <aside class="side">
        <div v-if="!compact" class="legend">
          <span class="legend__title">Score de bienestar</span>
          <span class="legend__bar" />
          <div class="legend__labels">
            <span>{{ scoreRange.min }} · más bajo</span>
            <span>{{ scoreRange.max }} · más alto</span>
          </div>
        </div>

        <div class="zones">
          <span v-if="!compact" class="zones__title"
            >Zonas que piden atención</span
          >
          <div
            v-for="zone in rankedZones.slice(0, compact ? 3 : 4)"
            :key="zone.cp"
            class="zone"
            :class="`zone--${zoneTone(zone.mean)}`"
          >
            <span class="zone__score">{{ Math.round(zone.mean) }}</span>
            <span class="zone__body">
              <span class="zone__place">{{ zone.cp }} · {{ zone.place }}</span>
              <span class="zone__count">{{ zone.n }} respuestas</span>
            </span>
          </div>
        </div>

        <p v-if="privacy.hiddenCpCount" class="note">
          <svg
            v-if="!compact"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8475a0"
            stroke-width="2.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="4" y="10" width="16" height="11" rx="3" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          <span>
            {{ privacy.hiddenCpCount }}
            {{
              privacy.hiddenCpCount === 1
                ? 'código postal quedó oculto'
                : 'códigos postales quedaron ocultos'
            }}
            por tener menos de {{ privacy.minGroupSize }} respuestas. Sus datos
            siguen contando en el promedio general.
          </span>
        </p>
      </aside>
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
  gap: 24px;
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

.toggle {
  flex: 0 0 auto;
  display: flex;
  gap: 8px;
}

.toggle__option {
  height: 34px;
  padding: 0 15px;
  border: 0;
  border-radius: 999px;
  background: #f4f1f8;
  color: #5c4a75;
  font-family: 'Figtree', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.toggle__option--active {
  background: #8475a0;
  color: #fff;
}

.empty {
  font-size: 14px;
  line-height: 1.6;
  color: #6b6080;
  margin: 0;
}

.body {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  align-items: stretch;
}

.body--compact {
  grid-template-columns: 1fr;
}

.map {
  height: 420px;
  border-radius: 20px;
  border: 2px solid #ece7f3;
  overflow: hidden;
}

.table {
  border: 2px solid #ece7f3;
  border-radius: 20px;
  overflow: hidden;
  max-height: 420px;
  overflow-y: auto;
}

.table__head,
.table__row {
  display: grid;
  grid-template-columns: 1fr 1.6fr 0.8fr 1fr;
  gap: 12px;
  padding: 12px 18px;
  align-items: center;
  font-size: 13px;
}

.table__head {
  position: sticky;
  top: 0;
  background: #f7f4fa;
  font-weight: 800;
  color: #6b6080;
}

.table__row {
  border-top: 1px solid #f2eef7;
  color: #4b3f60;
}

.table__cp {
  font-weight: 700;
  color: #3c2f52;
}

.table__num {
  text-align: right;
}

.table__score {
  font-weight: 800;
}

.table__score--low {
  color: #c77a1f;
}

.table__score--mid-low {
  color: #a5761f;
}

.table__score--mid {
  color: #6d5f88;
}

.table__score--high {
  color: #2c6a5c;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.legend {
  border: 2px solid #ece7f3;
  border-radius: 20px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend__title {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b6080;
}

.legend__bar {
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(to right, #c77a1f, #d9a24b, #8475a0, #3f8f7e);
}

.legend__labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 700;
  color: #9a90ad;
}

.zones {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.zones__title {
  font-size: 14px;
  font-weight: 800;
  color: #3c2f52;
}

.zone {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #f7f4fa;
}

.zone--low,
.zone--mid-low {
  background: #fbf3e8;
}

.zone--high {
  background: #edf6f3;
}

.zone__score {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  background: #8475a0;
}

.zone--low .zone__score {
  background: #c77a1f;
}

.zone--mid-low .zone__score {
  background: #d9a24b;
}

.zone--high .zone__score {
  background: #3f8f7e;
}

.zone__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.zone__place {
  font-size: 14px;
  font-weight: 700;
  color: #3c2f52;
}

.zone__count {
  font-size: 12px;
  color: #6b6080;
}

.note {
  margin: 0;
  margin-top: auto;
  display: flex;
  gap: 11px;
  align-items: flex-start;
  font-size: 13px;
  line-height: 1.55;
  color: #6b6080;
}

.note svg {
  flex: 0 0 17px;
  margin-top: 2px;
}

@media (max-width: 1100px) {
  .body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .panel {
    padding: 20px;
  }

  .panel__head {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
