<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import type { ChartData, ChartOptions, Plugin } from 'chart.js'
import { useAuthStore } from '~/store/auth'
import CalendarRecomendations from '~/components/institute/my-users/recommendations/calendar-recomendations.vue'
import type { IUserDetail } from '~/interfaces/user/user-detail.interface'
import { campusLabels, translateValue } from '~/utils/translations'

interface IUserSchedule {
  _id?: string
  appointmentDate: string | Date
  duration?: number
  modality?: string
}

const { $axios, $router } = useNuxtApp()
const route = useRoute()
const authStore = useAuthStore()

const userId = route.params.userId as string
const instituteId = authStore.user?.institute?._id || authStore.user?.institute

const userDetail = ref<IUserDetail | null>(null)
const isLoading = ref(false)
const errorMsg = ref('')

/** Umbral de bienestar por debajo del cual el diseño marca el caso en ámbar. */
const LOW_SCORE = 2.5
const MAX_SCORE = 5

async function fetchUserDetail() {
  if (!instituteId) {
    errorMsg.value = 'No pudimos identificar tu institución.'
    return
  }

  try {
    isLoading.value = true
    errorMsg.value = ''

    const { data } = await $axios.get<IUserDetail>(
      `/user/${userId}/institute/${instituteId}`,
    )

    userDetail.value = data
  } catch (error: any) {
    console.error('Error fetching user detail', error)
    errorMsg.value =
      error?.response?.data?.message ||
      'Error al obtener la información del usuario'
  } finally {
    isLoading.value = false
  }
}

const fullName = computed(() => {
  const user = userDetail.value
  if (!user) return ''
  return [user.name, user.lastName, user.surName].filter(Boolean).join(' ')
})

const initials = computed(() =>
  [userDetail.value?.name, userDetail.value?.lastName]
    .filter(Boolean)
    .map((part) => part!.charAt(0).toUpperCase())
    .join(''),
)

const studentData = computed(() => userDetail.value?.studentData)

function formatDate(date?: Date | string) {
  if (!date) return 'Sin registro'
  return new Date(date).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** Línea de contexto del hero: correo · edad · datos de campus. */
const metaLine = computed(() => {
  const user = userDetail.value
  if (!user) return ''

  const parts: string[] = [user.email]

  if (studentData.value?.age) parts.push(`${studentData.value.age} años`)

  const campus = studentData.value?.campusInformation as
    | Record<string, unknown>
    | undefined

  if (campus) {
    for (const value of Object.values(campus)) {
      if (typeof value === 'string' && value) parts.push(translateValue(value))
      if (parts.length >= 4) break
    }
  }

  return parts.join(' · ')
})

const campusEntries = computed(() => {
  const campus = studentData.value?.campusInformation as
    | Record<string, unknown>
    | undefined

  if (!campus) return []

  return Object.entries(campus).map(([key, value]) => ({
    label: campusLabels[key] || key,
    value: translateValue(value),
  }))
})

/* ---------------------------------------------------------------
 * Evolución del bienestar — construida con los resultados reales
 * ------------------------------------------------------------- */

const chronologicalResults = computed(() =>
  [...(userDetail.value?.questionnaireResults ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  ),
)

const chartPoints = computed(() =>
  chronologicalResults.value.slice(-6).map((result) => ({
    score: result.score,
    low: result.score < LOW_SCORE,
    title: result.questionnaireTitle,
    label: new Date(result.createdAt).toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
    }),
  })),
)

/**
 * Serie única con realce de estado: morado de marca, ámbar por debajo del
 * umbral de atención. El color no va solo — la línea de umbral, el tooltip y
 * la tabla de abajo repiten el dato.
 */
const chartData = computed<ChartData<'bar'>>(() => ({
  labels: chartPoints.value.map((point) => point.label),
  datasets: [
    {
      label: 'Bienestar',
      data: chartPoints.value.map((point) => point.score),
      backgroundColor: chartPoints.value.map((point) =>
        point.low ? '#d69a4c' : '#cbadd8',
      ),
      hoverBackgroundColor: chartPoints.value.map((point) =>
        point.low ? '#c2872f' : '#b795c9',
      ),
      borderRadius: { topLeft: 7, topRight: 7, bottomLeft: 0, bottomRight: 0 },
      borderSkipped: 'bottom',
      categoryPercentage: 0.82,
      barPercentage: 0.9,
      maxBarThickness: 56,
    },
  ],
}))

/** Línea punteada en el umbral de atención, para que el ámbar se explique. */
const thresholdLine: Plugin<'bar'> = {
  id: 'attentionThreshold',
  afterDatasetsDraw(chart) {
    const yScale = chart.scales.y
    if (!yScale) return

    const y = yScale.getPixelForValue(LOW_SCORE)
    const { left, right } = chart.chartArea
    const ctx = chart.ctx

    ctx.save()
    ctx.beginPath()
    ctx.setLineDash([4, 4])
    ctx.lineWidth = 1
    ctx.strokeStyle = '#d9b98c'
    ctx.moveTo(left, y)
    ctx.lineTo(right, y)
    ctx.stroke()

    ctx.setLineDash([])
    ctx.font = '600 10px Figtree, sans-serif'
    ctx.fillStyle = '#a8813f'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`Umbral ${LOW_SCORE}`, right, y - 3)
    ctx.restore()
  },
}

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { top: 8, right: 6 } },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        color: '#9b8fb0',
        font: { family: 'Figtree, sans-serif', size: 12, weight: 600 },
      },
    },
    y: {
      beginAtZero: true,
      max: MAX_SCORE,
      ticks: {
        stepSize: 1,
        color: '#9b8fb0',
        font: { family: 'Figtree, sans-serif', size: 11 },
      },
      grid: { color: '#f4f1f8' },
      border: { display: false },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#3c2f52',
      padding: 10,
      cornerRadius: 10,
      displayColors: false,
      titleFont: { family: 'Figtree, sans-serif', size: 12, weight: 700 },
      bodyFont: { family: 'Figtree, sans-serif', size: 12 },
      callbacks: {
        title: (items) => chartPoints.value[items[0].dataIndex]?.title ?? '',
        label: (item) =>
          `${item.parsed.y} / ${MAX_SCORE}.0 · ${chartPoints.value[item.dataIndex]?.label}`,
      },
    },
  },
}))

const trend = computed(() => {
  const points = chartPoints.value
  if (points.length < 2) return null

  const delta = points[points.length - 1].score - points[0].score
  if (Math.abs(delta) < 0.05)
    return { text: 'Sin cambio relevante', low: false }

  const arrow = delta < 0 ? '↓' : '↑'
  return {
    text: `${arrow} ${Math.abs(delta).toFixed(1)} en ${points.length} registros`,
    low: delta < 0,
  }
})

const needsAttention = computed(() => {
  const points = chartPoints.value
  if (!points.length) return false
  return points[points.length - 1].low
})

/** Resultados más recientes primero, como en el diseño. */
const recentResults = computed(() => [...chronologicalResults.value].reverse())

/* ---------------------------------------------------------------
 * Agenda
 * ------------------------------------------------------------- */

const schedules = ref<IUserSchedule[]>([])
const isLoadingSchedules = ref(false)

const upcomingSchedules = computed(() =>
  schedules.value
    .filter(
      (schedule) => new Date(schedule.appointmentDate).getTime() >= Date.now(),
    )
    .sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime(),
    ),
)

const nextSchedule = computed(() => upcomingSchedules.value[0] ?? null)

function formatAppointment(date: string | Date) {
  return new Date(date).toLocaleString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function fetchSchedules() {
  try {
    isLoadingSchedules.value = true
    const { data } = await $axios.get<IUserSchedule[]>(
      `/calendary/patient/${userId}`,
    )
    schedules.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching schedules', error)
    schedules.value = []
  } finally {
    isLoadingSchedules.value = false
  }
}

/* ---------------------------------------------------------------
 * Alta de citas
 * ------------------------------------------------------------- */

const showScheduleDialog = ref(false)
const isSavingSchedule = ref(false)
const scheduleError = ref('')
const day = ref('')
const startHour = ref('')
const endHour = ref('')

const scheduleDuration = computed(() => {
  if (!startHour.value || !endHour.value) return null

  const [startH, startM] = startHour.value.split(':').map(Number)
  const [endH, endM] = endHour.value.split(':').map(Number)

  if ([startH, startM, endH, endM].some((part) => Number.isNaN(part)))
    return null

  return endH * 60 + endM - (startH * 60 + startM)
})

function openScheduleDialog() {
  scheduleError.value = ''
  day.value = ''
  startHour.value = ''
  endHour.value = ''
  showScheduleDialog.value = true
}

function validateSchedule(): string {
  if (!day.value) return 'Selecciona el día de la cita.'
  if (!startHour.value) return 'Selecciona la hora de inicio.'
  if (!endHour.value) return 'Selecciona la hora de fin.'

  const duration = scheduleDuration.value
  if (duration === null) return 'Las horas seleccionadas no son válidas.'
  if (duration < 15) return 'La cita debe durar al menos 15 minutos.'
  if (duration > 180) return 'La cita no puede durar más de 180 minutos.'

  return ''
}

async function saveSchedule() {
  const validationError = validateSchedule()
  if (validationError) {
    scheduleError.value = validationError
    return
  }

  const psychologistId = authStore.user?._id || authStore.user?.id
  if (!psychologistId) {
    scheduleError.value =
      'No pudimos identificar tu sesión. Vuelve a iniciar sesión.'
    return
  }

  const appointmentDate = new Date(`${day.value}T${startHour.value}`)

  try {
    isSavingSchedule.value = true
    scheduleError.value = ''

    const { data } = await $axios.post<IUserSchedule>('/calendary', {
      patientId: userId,
      psychologistId,
      appointmentDate: appointmentDate.toISOString(),
      duration: scheduleDuration.value,
    })

    schedules.value.push(data ?? { appointmentDate })
    showScheduleDialog.value = false
  } catch (error: any) {
    console.error('Error creating appointment', error)
    scheduleError.value =
      error?.response?.data?.message ||
      'No pudimos agendar la cita. Intenta de nuevo.'
  } finally {
    isSavingSchedule.value = false
  }
}

onMounted(() => {
  fetchUserDetail()
  fetchSchedules()
})
</script>

<template>
  <div class="detail">
    <p v-if="isLoading" class="state">Cargando información del usuario…</p>

    <p v-else-if="errorMsg" class="state state--error">{{ errorMsg }}</p>

    <template v-else-if="userDetail">
      <div class="crumb">
        <button
          type="button"
          class="crumb__back"
          aria-label="Volver a mis usuarios"
          @click="$router.push('/institute/my-users')"
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3c2f52"
            stroke-width="2.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span class="crumb__text">Mis usuarios / {{ fullName }}</span>
      </div>

      <section class="hero">
        <span
          class="hero__avatar"
          :class="{ 'hero__avatar--warn': needsAttention }"
        >
          {{ initials }}
        </span>
        <div class="hero__copy">
          <div class="hero__name-row">
            <span class="hero__name">{{ fullName }}</span>
            <span v-if="needsAttention" class="badge badge--warn">
              Requiere atención
            </span>
            <span v-if="!userDetail.active" class="badge badge--off">
              Inactivo
            </span>
          </div>
          <span class="hero__meta">{{ metaLine }}</span>
        </div>
        <div class="hero__actions">
          <NuxtLink
            to="/institute/my-users/clinic-history"
            class="btn btn--ghost"
          >
            Historia clínica
          </NuxtLink>
          <button
            type="button"
            class="btn btn--primary"
            @click="openScheduleDialog"
          >
            Agendar cita
          </button>
        </div>
      </section>

      <div class="layout">
        <div class="layout__main">
          <section class="card card--pad">
            <div class="card__head">
              <span class="card__title">Evolución del bienestar</span>
              <span
                v-if="trend"
                class="card__trend"
                :class="{ 'card__trend--warn': trend.low }"
              >
                {{ trend.text }}
              </span>
            </div>

            <p v-if="!chartPoints.length" class="state state--inline">
              Sin cuestionarios respondidos todavía.
            </p>

            <div v-else class="chart">
              <Bar
                :data="chartData"
                :options="chartOptions"
                :plugins="[thresholdLine]"
              />
            </div>
          </section>

          <section class="card">
            <div class="card__title card__title--inset">
              Cuestionarios realizados
            </div>

            <p v-if="!recentResults.length" class="state state--inline">
              Este usuario no ha realizado cuestionarios.
            </p>

            <div v-else class="table-wrap">
              <table class="table">
                <thead>
                  <tr>
                    <th class="table__pad-lg">Cuestionario</th>
                    <th>Score</th>
                    <th class="table__pad-lg table__right">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="result in recentResults"
                    :key="result.questionnaireResultId"
                  >
                    <td class="table__pad-lg table__name">
                      {{ result.questionnaireTitle }}
                    </td>
                    <td
                      class="table__score"
                      :class="{
                        'table__score--warn': result.score < LOW_SCORE,
                      }"
                    >
                      {{ result.score }} / {{ MAX_SCORE }}.0
                    </td>
                    <td class="table__pad-lg table__right table__muted">
                      {{ formatDate(result.createdAt) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside class="layout__side">
          <section class="agenda">
            <span class="agenda__title">Citas en agenda</span>

            <span v-if="isLoadingSchedules" class="agenda__empty">
              Cargando agenda…
            </span>

            <div v-else-if="nextSchedule" class="agenda__next">
              <img src="/calendar.png" alt="" class="agenda__icon" />
              <div class="agenda__copy">
                <span class="agenda__when">
                  {{ formatAppointment(nextSchedule.appointmentDate) }}
                </span>
                <span class="agenda__note">
                  {{ upcomingSchedules.length }}
                  {{
                    upcomingSchedules.length === 1
                      ? 'cita próxima'
                      : 'citas próximas'
                  }}
                </span>
              </div>
            </div>

            <span v-else class="agenda__empty">Sin citas próximas.</span>

            <button
              type="button"
              class="agenda__cta"
              @click="openScheduleDialog"
            >
              Agendar cita →
            </button>
          </section>

          <section v-if="campusEntries.length" class="card card--pad">
            <span class="card__title">Información del campus</span>
            <dl class="facts">
              <div
                v-for="entry in campusEntries"
                :key="entry.label"
                class="facts__item"
              >
                <dt>{{ entry.label }}</dt>
                <dd>{{ entry.value }}</dd>
              </div>
            </dl>
          </section>

          <section class="card card--pad">
            <span class="card__title">Datos de la cuenta</span>
            <dl class="facts">
              <div class="facts__item">
                <dt>Registro</dt>
                <dd>{{ formatDate(userDetail.registrationDate) }}</dd>
              </div>
              <div class="facts__item">
                <dt>Último acceso</dt>
                <dd>{{ formatDate(userDetail.lastAccess) }}</dd>
              </div>
              <div v-if="studentData" class="facts__item">
                <dt>Encuesta demográfica</dt>
                <dd>
                  {{
                    studentData.demographicSurveyCompleted
                      ? 'Completada'
                      : 'No completada'
                  }}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>

      <CalendarRecomendations
        :user-id="userId"
        :institute-id="String(instituteId || '')"
      />
    </template>

    <v-dialog v-model="showScheduleDialog" max-width="560">
      <div class="dialog">
        <h2 class="dialog__title">Agendar nueva cita</h2>
        <p class="dialog__subtitle">{{ fullName }}</p>

        <label class="field">
          <span class="field__label">Día de la cita</span>
          <input v-model="day" class="field__input" type="date" />
        </label>

        <div class="dialog__row">
          <label class="field">
            <span class="field__label">Hora de inicio</span>
            <input v-model="startHour" class="field__input" type="time" />
          </label>
          <label class="field">
            <span class="field__label">Hora de fin</span>
            <input v-model="endHour" class="field__input" type="time" />
          </label>
        </div>

        <p
          v-if="scheduleDuration !== null && scheduleDuration > 0"
          class="dialog__hint"
        >
          Duración: {{ scheduleDuration }} minutos
        </p>

        <p v-if="scheduleError" class="dialog__error">{{ scheduleError }}</p>

        <div class="dialog__actions">
          <button
            type="button"
            class="btn btn--ghost"
            @click="showScheduleDialog = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn--primary"
            :disabled="isSavingSchedule"
            @click="saveSchedule"
          >
            {{ isSavingSchedule ? 'Agendando…' : 'Agendar' }}
          </button>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<style scoped>
.detail {
  min-height: 100%;
  background: #f5f4f8;
  padding: 24px 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
}

.state {
  margin: 0;
  padding: 48px 0;
  text-align: center;
  font-size: 14px;
  color: #7d7391;
}

.state--inline {
  padding: 24px 22px;
}

.state--error {
  color: #b3261e;
}

/* Migas ------------------------------------------------------------ */

.crumb {
  display: flex;
  align-items: center;
  gap: 12px;
}

.crumb__back {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border: 0;
  border-radius: 999px;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.crumb__back:hover {
  background: #f0eaf5;
}

.crumb__text {
  font-size: 14px;
  font-weight: 600;
  color: #7d7391;
}

/* Hero -------------------------------------------------------------- */

.hero {
  background: #fff;
  border: 1px solid #efebf5;
  border-radius: 22px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.hero__avatar {
  width: 70px;
  height: 70px;
  flex: 0 0 70px;
  border-radius: 999px;
  background: #cbadd8;
  color: #3c2f52;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
}

.hero__avatar--warn {
  background: #f3d9b8;
  color: #7a4f14;
}

.hero__copy {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.hero__name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hero__name {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.hero__meta {
  font-size: 14px;
  color: #7d7391;
}

.badge {
  display: inline-flex;
  height: 26px;
  align-items: center;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.badge--warn {
  background: #fdf1e3;
  color: #8a5a1f;
}

.badge--off {
  background: #fbe6e4;
  color: #a02a20;
}

.hero__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.btn--primary {
  background: #8475a0;
  color: #fff;
}

.btn--primary:hover {
  background: #6d5f88;
}

.btn--primary:disabled {
  opacity: 0.6;
  cursor: default;
}

.btn--ghost {
  border: 2px solid #ded6ea;
  background: #fff;
  color: #3c2f52;
}

.btn--ghost:hover {
  border-color: #8475a0;
  color: #8475a0;
}

/* Layout ------------------------------------------------------------ */

.layout {
  display: grid;
  grid-template-columns: 1fr 330px;
  gap: 18px;
  align-items: start;
}

.layout__main,
.layout__side {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.card {
  background: #fff;
  border: 1px solid #efebf5;
  border-radius: 22px;
  overflow: hidden;
}

.card--pad {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card__title {
  font-size: 17px;
  font-weight: 800;
}

.card__title--inset {
  display: block;
  padding: 20px 22px 12px;
}

.card__trend {
  font-size: 13px;
  font-weight: 700;
  color: #065c5d;
}

.card__trend--warn {
  color: #8a5a1f;
}

/* Gráfica ----------------------------------------------------------- */

.chart {
  position: relative;
  height: 190px;
}

/* Tabla ------------------------------------------------------------- */

.table-wrap {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table thead tr {
  height: 42px;
  background: #faf9fc;
}

.table thead th {
  padding: 0 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8a7ea3;
  white-space: nowrap;
}

.table tbody tr {
  height: 50px;
  border-top: 1px solid #f4f1f8;
}

.table tbody td {
  padding: 0 14px;
}

.table__pad-lg {
  padding-left: 22px !important;
  padding-right: 22px !important;
}

.table__right {
  text-align: right;
}

.table__name {
  font-weight: 600;
}

.table__score {
  font-weight: 700;
  color: #4b3f60;
  white-space: nowrap;
}

.table__score--warn {
  color: #8a5a1f;
}

.table__muted {
  color: #7d7391;
  white-space: nowrap;
}

/* Agenda ------------------------------------------------------------ */

.agenda {
  background: #3c2f52;
  color: #fff;
  border-radius: 22px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.agenda__title {
  font-size: 16px;
  font-weight: 800;
}

.agenda__next {
  display: flex;
  align-items: center;
  gap: 12px;
}

.agenda__icon {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.agenda__copy {
  display: flex;
  flex-direction: column;
}

.agenda__when {
  font-size: 14px;
  font-weight: 700;
}

.agenda__note,
.agenda__empty {
  font-size: 12px;
  color: #c3b6d8;
}

.agenda__cta {
  align-self: flex-start;
  border: 0;
  padding: 0;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #cbadd8;
  cursor: pointer;
}

.agenda__cta:hover {
  color: #fff;
}

/* Fichas ------------------------------------------------------------ */

.facts {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.facts__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.facts__item dt {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9b8fb0;
}

.facts__item dd {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

/* Diálogo ------------------------------------------------------------ */

.dialog {
  background: #fff;
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
}

.dialog__title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.dialog__subtitle {
  margin: -10px 0 0;
  font-size: 14px;
  color: #7d7391;
}

.dialog__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-size: 12px;
  font-weight: 700;
  color: #6b6080;
}

.field__input {
  height: 42px;
  padding: 0 14px;
  border: 1px solid #e6e0ef;
  border-radius: 12px;
  background: #faf9fc;
  font-family: inherit;
  font-size: 14px;
  color: #0e2a36;
  outline: none;
}

.field__input:focus {
  border-color: #8475a0;
  background: #fff;
}

.dialog__hint {
  margin: 0;
  font-size: 12px;
  color: #7d7391;
}

.dialog__error {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #b3261e;
}

.dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

@media (max-width: 1100px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .detail {
    padding-left: 20px;
    padding-right: 20px;
  }

  .dialog__row {
    grid-template-columns: 1fr;
  }
}
</style>
