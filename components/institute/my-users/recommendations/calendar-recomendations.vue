<script setup lang="ts">
import type { ITrackingMonthlyStatsResponse } from '~/interfaces/tracking/tracking-stats.interface'

const { $axios } = useNuxtApp()

const props = defineProps<{
  userId: string
  instituteId: string
}>()

const isLoading = ref(false)
const currentDate = ref<Date | string>(new Date())
const selectedCalendarDate = ref<Date | null>(null)
const completedByDay = ref<Record<number, number>>({})
const recommendationsByDay = ref<Record<number, string[]>>({})

const parseCalendarDateValue = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'string') {
    const localDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (localDateMatch) {
      const [, year, month, day] = localDateMatch
      return new Date(Number(year), Number(month) - 1, Number(day))
    }

    const parsedDate = new Date(value)
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate
    }
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const year = Number(record.year)
    const month = Number(record.month)
    const day = Number(record.day)

    if (
      Number.isInteger(year) &&
      Number.isInteger(month) &&
      Number.isInteger(day) &&
      year > 0 &&
      month > 0 &&
      day > 0
    ) {
      return new Date(year, month - 1, day)
    }
  }

  return null
}

const getSafeDate = (value: Date | string): Date => {
  const parsedDate = parseCalendarDateValue(value)
  return parsedDate ?? new Date()
}

const calendarBaseDate = computed(() => getSafeDate(currentDate.value))
const currentMonth = computed(() => calendarBaseDate.value.getMonth() + 1)
const currentYear = computed(() => calendarBaseDate.value.getFullYear())

const selectedDayCompletedCount = computed(() => {
  if (!selectedCalendarDate.value) {
    return 0
  }

  return completedByDay.value[selectedCalendarDate.value.getDate()] ?? 0
})

const selectedDayRecommendations = computed(() => {
  if (!selectedCalendarDate.value) {
    return [] as string[]
  }

  return recommendationsByDay.value[selectedCalendarDate.value.getDate()] ?? []
})

const selectedDayLabel = computed(() => {
  if (!selectedCalendarDate.value) {
    return ''
  }

  return selectedCalendarDate.value.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const onCalendarDateClick = (payload: any) => {
  const clickedDate = parseCalendarDateValue(payload?.date ?? payload)
  if (!clickedDate) {
    return
  }

  selectedCalendarDate.value = clickedDate
}

const buildCalendarEvents = () => {
  const events: {
    name: string
    start: Date
    end: Date
    allDay: boolean
    color: string
  }[] = []

  for (const [day, madeCount] of Object.entries(completedByDay.value)) {
    const dayNumber = Number(day)
    if (madeCount <= 0) {
      continue
    }

    const dayDate = new Date(
      currentYear.value,
      calendarBaseDate.value.getMonth(),
      dayNumber,
    )

    events.push({
      name: `Logradas: ${madeCount}`,
      start: dayDate,
      end: dayDate,
      allDay: true,
      color: 'success',
    })
  }

  return events
}

const calendarEvents = computed(() => buildCalendarEvents())

const fetchMonthlyStats = async () => {
  if (!props.userId || !props.instituteId) {
    completedByDay.value = {}
    recommendationsByDay.value = {}
    return
  }

  const statsResponse = await $axios.get(
    `/tracking/user/${props.userId}/institute/${props.instituteId}/stats`,
    {
      params: {
        month: currentMonth.value,
        year: currentYear.value,
      },
    },
  )

  const statsData = statsResponse.data as ITrackingMonthlyStatsResponse
  completedByDay.value = statsData.completedByDay.reduce(
    (acc, item) => {
      acc[item.day] = item.count
      return acc
    },
    {} as Record<number, number>,
  )

  recommendationsByDay.value = statsData.completedByDay.reduce(
    (acc, item) => {
      acc[item.day] = item.recommendations ?? []
      return acc
    },
    {} as Record<number, string[]>,
  )
}

const fetchData = async () => {
  try {
    isLoading.value = true
    await fetchMonthlyStats()
  } catch (error) {
    console.log(error)
    alert('Error al cargar el historial de recomendaciones.')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchData()
})

watch([currentMonth, currentYear], async () => {
  await fetchMonthlyStats()
})

watch(currentDate, (newDate) => {
  selectedCalendarDate.value = getSafeDate(newDate)
})
</script>

<template>
  <div v-show="isLoading" class="w-100 h-100">
    <div class="w-100 h-100 d-flex justify-center align-center">
      <v-progress-circular color="primary" indeterminate></v-progress-circular>
    </div>
  </div>

  <div v-show="!isLoading">
    <v-row class="mt-6" no-gutters>
      <v-col cols="12">
        <h2 class="handlee-regular text-h5 font-weight-thin mb-4">
          Historial de recomendaciones
        </h2>
      </v-col>
      <v-col cols="12">
        <v-card rounded="xl" :elevation="5" class="pa-4">
          <v-calendar
            v-model="currentDate"
            :events="calendarEvents"
            @click:date="onCalendarDateClick"
          ></v-calendar>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="selectedCalendarDate" class="mt-2" no-gutters>
      <v-col cols="12">
        <v-card rounded="xl" :elevation="3" class="pa-4">
          <span class="catamaran-regular text-subtitle-1">
            El {{ selectedDayLabel }} se completaron
            <strong>{{ selectedDayCompletedCount }}</strong>
            recomendaciones.
          </span>

          <ul v-if="selectedDayRecommendations.length > 0" class="pl-6 mt-3">
            <li
              v-for="(recommendation, index) in selectedDayRecommendations"
              :key="`${recommendation}-${index}`"
              class="catamaran-regular mb-1"
            >
              {{ recommendation }}
            </li>
          </ul>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
