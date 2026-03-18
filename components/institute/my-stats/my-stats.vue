<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { useInstituteStore } from '~/store/institute'
import { Bar, Radar } from 'vue-chartjs'

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
      nucleo_emocional: 'Núcleo',
      dim_b: 'Dim B',
      dim_c: 'Dim C',
      dim_d: 'Dim D',
      dim_e: 'Dim E',
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
  } catch (error) {
    console.error('Error fetching stats:', error)
  } finally {
    isLoading.value = false
  }
})
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
            <v-card class="pa-3" rounded="xl">
              <v-card-title>
                <h2 class="handlee-regular text-h6 font-weight-thin">
                  Histograma de scores totales
                </h2>
              </v-card-title>
              <Bar :data="totalScoresData" :options="totalScoresOptions" />
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="pa-3" rounded="xl">
              <v-card-title>
                <h2 class="handlee-regular text-h6 font-weight-thin">
                  Radar de subescalas (promedio 1–5)
                </h2>
              </v-card-title>
              <Radar :data="subscalesData" :options="subscalesOptions" />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
  </v-container>
</template>
