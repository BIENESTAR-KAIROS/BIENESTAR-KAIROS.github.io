<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { useInstituteStore } from '~/store/institute'
import { Bar, Radar } from 'vue-chartjs'
import L from 'leaflet'

const days = [30, 90, 15, 8]
const selectedDays = ref(days[0])

const nuxtApp = useNuxtApp()
const authStore = useAuthStore()
const instituteStore = useInstituteStore()

const answersVolume = ref(0)
const averageScore = ref(0)
const wellnessScore = ref(0)
const standardDeviation = ref(0)
const minMaxScore = ref(`0 / 0`)

const totalScoresData = ref({
  labels: ['Internas', 'Externas'],
  datasets: [
    {
      label: 'Conexiones por día',
      data: [60, 40],
    },
  ],
})
const totalScoresOptions = ref({
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { color: '#1e2d40' },
      ticks: { maxTicksLimit: 10 },
      title: { display: true, text: 'Score total', color: '#64748b' },
    },
    y: {
      grid: { color: '#1e2d40' },
      title: { display: true, text: 'Estudiantes', color: '#64748b' },
    },
  },
})

const subscalesData = ref({
  labels: ['Autonomía', 'Competencia', 'Relación', 'Estructura'],
  datasets: [
    {
      label: 'Subescalas',
      data: [3.5, 4.2, 3.8, 4.0],
      backgroundColor: 'rgba(56,189,248,.7)',
      borderColor: 'rgba(56,189,248,1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(56,189,248,1)',
    },
  ],
})
const subscalesOptions = ref({
  scales: {
    r: {
      min: 1,
      max: 5,
      grid: { color: '#1e2d40' },
      angleLines: { color: '#1e2d40' },
      pointLabels: { color: '#94a3b8', font: { size: 11 } },
      ticks: { stepSize: 1, color: '#475569', backdropColor: 'transparent' },
    },
  },
  plugins: { legend: { display: false } },
})

// Demographic /////////////

const map = ref(null) as any
const MAP_POINTS = ref([])
const MAP_SMIN = ref(0)
const MAP_SMAX = ref(150)
const bounds = ref([])
const heatPoints = ref([])
const heatLayer = ref(null)

const updateHeatMap = async () => {
  if (!map.value?.leafletObject || !heatPoints.value.length) return

  const leafletInstance = map.value.leafletObject
  leafletInstance.invalidateSize()

  // 2. Convertimos el Proxy a un Array normal de JS
  const rawPoints = toRaw(heatPoints.value).map((p) => toRaw(p))

  if (heatLayer.value) {
    leafletInstance.removeLayer(heatLayer.value)
  }

  try {
    // 3. Pasamos rawPoints en lugar de heatPoints.value
    heatLayer.value = await useLHeat({
      leafletObject: leafletInstance,
      heatPoints: rawPoints,
      radius: 30,
    })
  } catch (e) {
    console.error('Error al crear la capa de calor:', e)
  }
}

function mapWeight(s) {
  const range = Math.max(MAP_SMAX.value - MAP_SMIN.value, 1)
  const weight = (s - MAP_SMIN.value) / range
  // Leaflet heat requiere que el peso sea un número entre 0 y 1
  return Math.max(0.05, Math.min(1, weight || 0))
}

function mapColor(s) {
  const t = (s - MAP_SMIN.value) / Math.max(MAP_SMAX.value - MAP_SMIN.value, 1)
  if (t > 0.75) return '#38bdf8'
  if (t > 0.5) return '#34d399'
  if (t > 0.25) return '#fbbf24'
  return '#fb923c'
}

// Demographic /////////////

const isLoading = ref(false)
onMounted(async () => {
  isLoading.value = true
  try {
    const response = await nuxtApp.$statsApi.get(
      `/api/analytics/BienestarKairosDev/bienestar30/summary`,
    )

    const data = response.data
    answersVolume.value = data.global_stats.n
    averageScore.value = data.global_stats.mean
    wellnessScore.value = data.global_stats.bienestar_promedio_1_5
    standardDeviation.value = data.global_stats.std
    minMaxScore.value = `${data.global_stats.min} / ${data.global_stats.max}`

    const dist = data.score_distribution
    totalScoresData.value = {
      labels: dist.map((b) => (b._id !== 'other' ? b._id : '?')),
      datasets: [
        {
          data: dist.map((b) => b.count),
          backgroundColor: dist.map((_, i) => {
            const p = i / dist.length
            return p < 0.33
              ? 'rgba(129,140,248,.7)'
              : p < 0.66
                ? 'rgba(56,189,248,.7)'
                : 'rgba(52,211,153,.7)'
          }),
          borderRadius: 3,
          borderSkipped: false,
        },
      ],
    }

    const SUBS = ['nucleo_emocional', 'dim_b', 'dim_c', 'dim_d', 'dim_e']
    const SCOLOR = {
      nucleo_emocional: '#38bdf8',
      dim_b: '#818cf8',
      dim_c: '#34d399',
      dim_d: '#fb923c',
      dim_e: '#f472b6',
    }
    const SLABEL = {
      nucleo_emocional: 'Estado de ánimo',
      dim_b: 'Resilencia',
      dim_c: 'Relaciones sociales',
      dim_d: 'Propósito',
      dim_e: 'Autonomía',
    }
    const subscales = data.subscale_avg
    subscalesData.value = {
      labels: SUBS.map((k) => SLABEL[k]),
      datasets: [
        {
          data: SUBS.map(
            (k) => subscales.find((s) => s.subscale === k)?.avg ?? 0,
          ),
          backgroundColor: 'rgba(56,189,248,.13)',
          borderColor: '#38bdf8',
          pointBackgroundColor: SUBS.map((k) => SCOLOR[k]),
          pointRadius: 5,
          borderWidth: 2,
        },
      ],
    }

    // Demographic
    const demographicResponse = await nuxtApp.$statsApi.get(
      `/api/analytics/BienestarKairosDev/bienestar30/demographic`,
    )

    const dem = demographicResponse.data
    const dStudents = dem.students || []
    const dScores = dStudents.map((s) => s.score_total)
    const dMean = dScores.length
      ? dScores.reduce((a, b) => a + b, 0) / dScores.length
      : 0
    const dAges = dStudents.filter((s) => s.age).map((s) => s.age)
    const dCPs = new Set(
      dStudents.filter((s) => s.zipCode).map((s) => s.zipCode),
    )

    MAP_POINTS.value = dem.cp_map || []
    if (MAP_POINTS.value.length) {
      const sc = MAP_POINTS.value.map((p) => p.mean)
      MAP_SMIN.value = Math.min(...sc)
      MAP_SMAX.value = Math.max(...sc)
      const sm = sc.reduce((a, b) => a + b, 0) / sc.length
      const lats = MAP_POINTS.value.map((p) => p.lat),
        lngs = MAP_POINTS.value.map((p) => p.lng)
      if (lats.length > 0) {
        bounds.value = [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ]
      } else {
        // Default a CDMX si no hay puntos
        bounds.value = [
          [19.2, -99.3],
          [19.6, -99.0],
        ]
      }
    }

    console.log(MAP_POINTS)

    heatPoints.value = MAP_POINTS.value
      .filter((p) => {
        // Solo permitimos puntos que tengan lat y lng numéricos y no sean NaN
        const hasLat = typeof p.lat === 'number' && !isNaN(p.lat)
        const hasLng = typeof p.lng === 'number' && !isNaN(p.lng)
        return hasLat && hasLng
      })
      .map((p) => [
        p.lat,
        p.lng,
        mapWeight(p.mean), // Intensidad
      ])
    // Solo si hay puntos, intentamos actualizar el mapa
    if (heatPoints.value.length > 0) {
      await updateHeatMap()
    } else {
      console.warn(
        'No se encontraron puntos geográficos válidos para el heatmap.',
      )
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  } finally {
    isLoading.value = false
  }
})

const onMapReady = async () => {
  await updateHeatMap()
}
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <div class="my-4">
          <h1 class="handlee-regular text-h4 font-weight-thin">
            Mis estadísticas
          </h1>
        </div>
      </v-col>
      <v-col cols="12">
        <div class="my-4">
          <h2 class="handlee-regular text-h6 font-weight-thin">
            Aquí podrás crear filtros personalizados para obtener estadísticas
            más exactas de tu población y su comportamiento.
          </h2>
        </div>
      </v-col>
      <v-container>
        <v-row>
          <v-col cols="12">
            <div class="my-4">
              <h1 class="handlee-regular text-h4 font-weight-thin">
                Resumen global
              </h1>
            </div>
          </v-col>
          <v-col>
            <v-card class="pa-3" rounded="xl">
              <v-card-title>
                <h2 class="handlee-regular text-h5 font-weight-thin">
                  Respondentes
                </h2>
              </v-card-title>
              <v-card-text class="handlee-regular text-h4 font-weight-bold">
                {{ answersVolume }}
              </v-card-text>
              <v-card-subtitle> total estudiantes </v-card-subtitle>
            </v-card>
          </v-col>
          <v-col>
            <v-card class="pa-3" rounded="xl">
              <v-card-title>
                <h2 class="handlee-regular text-h5 font-weight-thin">
                  Score promedio
                </h2>
              </v-card-title>
              <v-card-text class="handlee-regular text-h4 font-weight-bold">
                {{ averageScore }}
              </v-card-text>
              <v-card-subtitle> escala 30 - 150 </v-card-subtitle>
            </v-card>
          </v-col>
          <v-col>
            <v-card class="pa-3" rounded="xl">
              <v-card-title>
                <h2 class="handlee-regular text-h5 font-weight-thin">
                  Bienestar
                </h2>
              </v-card-title>
              <v-card-text class="handlee-regular text-h4 font-weight-bold">
                {{ wellnessScore }}
              </v-card-text>
              <v-card-subtitle> escala 1 - 5 </v-card-subtitle>
            </v-card>
          </v-col>
          <v-col>
            <v-card class="pa-3" rounded="xl">
              <v-card-title>
                <h2 class="handlee-regular text-h5 font-weight-thin">
                  Desviación estándar
                </h2>
              </v-card-title>
              <v-card-text class="handlee-regular text-h4 font-weight-bold">
                {{ standardDeviation }}
              </v-card-text>
              <v-card-subtitle> disperción </v-card-subtitle>
            </v-card>
          </v-col>
          <v-col>
            <v-card class="pa-3" rounded="xl">
              <v-card-title>
                <h2 class="handlee-regular text-h5 font-weight-thin">
                  MIN / MAX
                </h2>
              </v-card-title>
              <v-card-text class="handlee-regular text-h4 font-weight-bold">
                {{ minMaxScore }}
              </v-card-text>
              <v-card-subtitle> rango observado </v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
      <v-container>
        <v-row>
          <v-col cols="12">
            <div class="my-4">
              <h1 class="handlee-regular text-h4 font-weight-thin">
                Distribución y subescalas
              </h1>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="pa-3 h-100" rounded="xl">
              <v-card-title>
                <h2 class="handlee-regular text-h6 font-weight-thin">
                  Histograma de scores totales
                </h2>
              </v-card-title>
              <Bar :data="totalScoresData" :options="totalScoresOptions" />
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="pa-3 h-100" rounded="xl">
              <v-card-title>
                <h2 class="handlee-regular text-h6 font-weight-thin">
                  Radar de subescalas (promedio 1–5)
                </h2>
              </v-card-title>
              <Radar :data="subscalesData" :options="subscalesOptions" />
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-card class="pa-3" rounded="xl">
              <v-card-title>
                <h2 class="handlee-regular text-h6 font-weight-thin">
                  Mapa de salud mental por código postal · CDMX
                </h2>
              </v-card-title>
              <div style="height: 500px; width: 100%">
                <LMap
                  ref="map"
                  :zoom="12"
                  :center="[19.32, -99.17]"
                  :use-global-leaflet="true"
                  @ready="onMapReady"
                  :bounds="bounds"
                >
                  <LTileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap © CARTO"
                    layer-type="base"
                    name="osm-wms.de"
                  />
                </LMap>
                <div id="map-legend">
                  <div class="map-leg-title">Score de bienestar</div>
                  <div class="map-leg-bar"></div>
                  <div class="map-leg-labels">
                    <span id="map-leg-min">{{ MAP_SMIN }}</span
                    ><span id="map-leg-max">{{ MAP_SMAX }}</span>
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
  </v-container>
</template>

<style>
#map-legend {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 999;
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.8rem 1rem;
  min-width: 170px;
}
.map-leg-title {
  font-family: var(--font-h);
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  margin-bottom: 0.5rem;
}
.map-leg-bar {
  height: 10px;
  border-radius: 4px;
  margin-bottom: 0.3rem;
  background: linear-gradient(to right, #fb923c, #fbbf24, #34d399, #38bdf8);
}
.map-leg-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.6rem;
  color: var(--muted);
}
.leaflet-popup-content-wrapper {
  background: #111827;
  border: 1px solid #1e2d40;
  border-radius: 8px;
  box-shadow: none;
  color: #e2e8f0;
}
.leaflet-popup-tip {
  background: #111827;
}
.leaflet-popup-content {
  margin: 10px 14px;
}
</style>
