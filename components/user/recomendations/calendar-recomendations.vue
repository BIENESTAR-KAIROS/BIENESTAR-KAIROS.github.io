<script setup lang="ts">
import type { ITrackingMonthlyStatsResponse } from '~/interfaces/tracking/tracking-stats.interface'
import { useAuthStore } from '~/store/auth'

interface IAppointment {
  _id: string
  appointmentDate: string
  status: string
}

const { $axios } = useNuxtApp()
const authStore = useAuthStore()

const isLoading = ref(false)
const viewDate = ref(new Date())
const selectedDay = ref<number | null>(new Date().getDate())
const completedByDay = ref<Record<number, number>>({})
const recommendationsByDay = ref<Record<number, string[]>>({})
const appointmentDays = ref<Set<number>>(new Set())

const today = new Date()

const currentMonth = computed(() => viewDate.value.getMonth())
const currentYear = computed(() => viewDate.value.getFullYear())

const monthLabel = computed(() =>
  viewDate.value
    .toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    .replace(/^\w/, (c) => c.toUpperCase()),
)

const weekdayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

const daysInMonth = computed(
  () => new Date(currentYear.value, currentMonth.value + 1, 0).getDate(),
)

const daysInPrevMonth = computed(
  () => new Date(currentYear.value, currentMonth.value, 0).getDate(),
)

const firstWeekday = computed(
  () => new Date(currentYear.value, currentMonth.value, 1).getDay(),
)

const isCurrentMonthInView = computed(
  () =>
    currentYear.value === today.getFullYear() &&
    currentMonth.value === today.getMonth(),
)

interface ICalendarCell {
  day: number
  inMonth: boolean
  isToday: boolean
  count: number
  hasAppointment: boolean
}

const calendarCells = computed<ICalendarCell[]>(() => {
  const cells: ICalendarCell[] = []

  for (let i = firstWeekday.value - 1; i >= 0; i--) {
    cells.push({
      day: daysInPrevMonth.value - i,
      inMonth: false,
      isToday: false,
      count: 0,
      hasAppointment: false,
    })
  }

  for (let day = 1; day <= daysInMonth.value; day++) {
    cells.push({
      day,
      inMonth: true,
      isToday: isCurrentMonthInView.value && day === today.getDate(),
      count: completedByDay.value[day] ?? 0,
      hasAppointment: appointmentDays.value.has(day),
    })
  }

  const trailing = (7 - (cells.length % 7)) % 7
  for (let day = 1; day <= trailing; day++) {
    cells.push({
      day,
      inMonth: false,
      isToday: false,
      count: 0,
      hasAppointment: false,
    })
  }

  return cells
})

function cellBackground(cell: ICalendarCell): string {
  if (!cell.inMonth) return 'transparent'
  if (cell.count >= 3) return '#065C5D'
  if (cell.count === 2) return '#6CC5CB'
  if (cell.count === 1) return '#DBF2F4'
  if (cell.hasAppointment) return '#F0EAF5'
  return '#f4f8f9'
}

function cellTextColor(cell: ICalendarCell): string {
  if (!cell.inMonth) return '#c3ced1'
  if (cell.count >= 3) return '#fff'
  if (cell.count === 2) return '#04494a'
  if (cell.count === 1) return '#065C5D'
  if (cell.hasAppointment) return '#5c4a75'
  return '#5c7078'
}

const selectedCell = computed(() =>
  calendarCells.value.find((cell) => cell.inMonth && cell.day === selectedDay.value),
)

const selectedDayLabel = computed(() => {
  if (!selectedCell.value) return ''
  const date = new Date(currentYear.value, currentMonth.value, selectedCell.value.day)
  return date
    .toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(/^\w/, (c) => c.toUpperCase())
})

const selectedDayRecommendations = computed(() => {
  if (!selectedCell.value) return [] as string[]
  return recommendationsByDay.value[selectedCell.value.day] ?? []
})

function selectDay(cell: ICalendarCell) {
  if (!cell.inMonth) return
  selectedDay.value = cell.day
}

function goToPrevMonth() {
  viewDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

function goToNextMonth() {
  viewDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

async function fetchMonthlyStats() {
  const response = await $axios.get<ITrackingMonthlyStatsResponse>(
    '/tracking/stats',
    { params: { month: currentMonth.value + 1, year: currentYear.value } },
  )

  const byDay: Record<number, number> = {}
  const recsByDay: Record<number, string[]> = {}

  for (const item of response.data.completedByDay) {
    byDay[item.day] = item.count
    recsByDay[item.day] = item.recommendations ?? []
  }

  completedByDay.value = byDay
  recommendationsByDay.value = recsByDay
}

async function fetchAppointments() {
  const userId = authStore.user?.id || authStore.user?._id
  if (!userId) {
    appointmentDays.value = new Set()
    return
  }

  try {
    const response = await $axios.get<IAppointment[]>(`/calendary/patient/${userId}`)
    const days = new Set<number>()

    for (const appointment of response.data) {
      if (appointment.status === 'cancelled') continue
      const date = new Date(appointment.appointmentDate)
      if (
        date.getFullYear() === currentYear.value &&
        date.getMonth() === currentMonth.value
      ) {
        days.add(date.getDate())
      }
    }

    appointmentDays.value = days
  } catch (error) {
    console.log(error)
    appointmentDays.value = new Set()
  }
}

async function fetchData() {
  try {
    isLoading.value = true
    await Promise.all([fetchMonthlyStats(), fetchAppointments()])
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)

watch([currentMonth, currentYear], () => {
  fetchData()
})
</script>

<template>
  <div class="calendar-card">
    <div class="calendar-card__header">
      <span class="calendar-card__month">{{ monthLabel }}</span>
      <div class="calendar-card__nav">
        <button type="button" class="calendar-card__nav-btn" @click="goToPrevMonth">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E2A36" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <button type="button" class="calendar-card__nav-btn" @click="goToNextMonth">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E2A36" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
    </div>

    <div class="calendar-card__weekdays">
      <span v-for="(label, i) in weekdayLabels" :key="i">{{ label }}</span>
    </div>

    <div v-if="isLoading" class="calendar-card__loading">
      <v-progress-circular color="primary" indeterminate size="28" />
    </div>

    <div v-else class="calendar-card__grid">
      <button
        v-for="(cell, i) in calendarCells"
        :key="i"
        type="button"
        class="calendar-card__cell"
        :class="{
          'calendar-card__cell--today': cell.isToday,
          'calendar-card__cell--selected': cell.inMonth && cell.day === selectedDay,
          'calendar-card__cell--muted': !cell.inMonth,
        }"
        :style="{ background: cellBackground(cell), color: cellTextColor(cell) }"
        :disabled="!cell.inMonth"
        @click="selectDay(cell)"
      >
        {{ cell.day }}
      </button>
    </div>

    <div class="calendar-card__legend">
      <span class="calendar-card__legend-dot" style="background: #065c5d" />
      <span class="calendar-card__legend-label">3+ tareas</span>
      <span class="calendar-card__legend-dot" style="background: #6cc5cb; margin-left: 8px" />
      <span class="calendar-card__legend-label">1–2 tareas</span>
      <span class="calendar-card__legend-dot" style="background: #f0eaf5; margin-left: 8px" />
      <span class="calendar-card__legend-label">Cita</span>
    </div>

    <div v-if="selectedCell" class="calendar-card__detail">
      <span class="calendar-card__detail-title">{{ selectedDayLabel }}</span>
      <span v-if="selectedCell.hasAppointment" class="calendar-card__detail-appointment">
        Tienes una cita agendada este día.
      </span>
      <ul v-if="selectedDayRecommendations.length > 0" class="calendar-card__detail-list">
        <li v-for="(rec, i) in selectedDayRecommendations" :key="i">{{ rec }}</li>
      </ul>
      <span
        v-else-if="!selectedCell.hasAppointment"
        class="calendar-card__detail-empty"
      >
        Sin tareas completadas este día.
      </span>
    </div>
  </div>
</template>

<style scoped>
.calendar-card {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.calendar-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.calendar-card__month {
  font-size: 18px;
  font-weight: 800;
}

.calendar-card__nav {
  display: flex;
  gap: 6px;
}

.calendar-card__nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 0;
  background: #f4f8f9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.calendar-card__nav-btn:hover {
  background: #dbf2f4;
}

.calendar-card__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #6b8189;
  text-align: center;
}

.calendar-card__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
}

.calendar-card__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-card__cell {
  aspect-ratio: 1;
  border-radius: 12px;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-family: 'Figtree', sans-serif;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.calendar-card__cell--muted {
  cursor: default;
}

.calendar-card__cell--today {
  box-shadow: inset 0 0 0 2px #0e2a36;
  font-weight: 800;
}

.calendar-card__cell--selected:not(.calendar-card__cell--muted) {
  box-shadow: inset 0 0 0 2px #07979f;
}

.calendar-card__legend {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 6px;
  border-top: 1px solid #f0f5f6;
  flex-wrap: wrap;
}

.calendar-card__legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 5px;
}

.calendar-card__legend-label {
  font-size: 12px;
  color: #5c7078;
}

.calendar-card__detail {
  background: #f4f8f9;
  border-radius: 18px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calendar-card__detail-title {
  font-size: 14px;
  font-weight: 700;
}

.calendar-card__detail-appointment {
  font-size: 13px;
  color: #5c4a75;
  font-weight: 600;
}

.calendar-card__detail-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calendar-card__detail-list li {
  font-size: 13px;
  color: #31474f;
}

.calendar-card__detail-empty {
  font-size: 13px;
  color: #5f767e;
}
</style>
