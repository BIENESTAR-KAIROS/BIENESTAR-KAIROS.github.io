<script setup lang="ts">
import type { ITrackingTask } from '~/interfaces/tracking/tracking-task.interface'
import type { ITrackingToggleResponse } from '~/interfaces/tracking/tracking-toggle.interface'
import type { ITrackingMonthlyStatsResponse } from '~/interfaces/tracking/tracking-stats.interface'

const { $axios } = useNuxtApp()

const isLoading = ref(false)
const currentDate = ref<Date | string>(new Date())
const selectedCalendarDate = ref<Date | null>(null)
const todayTasks = ref([] as ITrackingTask[])
const togglingRecommendationIds = ref([] as string[])
const completedByDay = ref<Record<number, number>>({})

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
      Number.isInteger(year)
      && Number.isInteger(month)
      && Number.isInteger(day)
      && year > 0
      && month > 0
      && day > 0
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

const isToggling = (recommendationId: string): boolean =>
  togglingRecommendationIds.value.includes(recommendationId)

const isSameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const selectedDayCompletedCount = computed(() => {
  if (!selectedCalendarDate.value) {
    return 0
  }

  return completedByDay.value[selectedCalendarDate.value.getDate()] ?? 0
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

const selectedDayRecommendations = computed(() => {
  if (!selectedCalendarDate.value || selectedDayCompletedCount.value <= 0) {
    return [] as string[]
  }

  const now = new Date()
  if (isSameDay(selectedCalendarDate.value, now)) {
    const completedToday = todayTasks.value
      .filter((task) => task.isCompleted)
      .map((task) => task.recommendation)

    if (completedToday.length > 0) {
      return completedToday
    }
  }

  const recommendationCatalog = todayTasks.value.map(
    (task) => task.recommendation,
  )

  if (recommendationCatalog.length === 0) {
    return Array.from(
      { length: selectedDayCompletedCount.value },
      () => 'Recomendación registrada',
    )
  }

  return Array.from({ length: selectedDayCompletedCount.value }, (_, i) => {
    return recommendationCatalog[i % recommendationCatalog.length]
  })
})

const onCalendarDateClick = (payload: any) => {
  const clickedDate = parseCalendarDateValue(payload?.date ?? payload)
  if (!clickedDate) {
    return
  }

  selectedCalendarDate.value = clickedDate
}

const getShortRecommendation = (
  recommendation: string,
  maxLength = 35,
): string => {
  if (recommendation.length <= maxLength) {
    return recommendation
  }

  return `${recommendation.slice(0, maxLength)}...`
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

const fetchTodayTasks = async () => {
  const todayResponse = await $axios.get('/tracking/today')
  todayTasks.value = todayResponse.data as ITrackingTask[]
}

const fetchMonthlyStats = async () => {
  const statsResponse = await $axios.get('/tracking/stats', {
    params: {
      month: currentMonth.value,
      year: currentYear.value,
    },
  })

  const statsData = statsResponse.data as ITrackingMonthlyStatsResponse
  completedByDay.value = statsData.completedByDay.reduce(
    (acc, item) => {
      acc[item.day] = item.count
      return acc
    },
    {} as Record<number, number>,
  )
}

const fetchData = async () => {
  try {
    isLoading.value = true
    await fetchTodayTasks()
    await fetchMonthlyStats()
  } catch (error) {
    console.log(error)
    alert('Error al cargar el historial de recomendaciones.')
  } finally {
    isLoading.value = false
  }
}

const toggleRecommendation = async (recommendationId: string) => {
  try {
    togglingRecommendationIds.value.push(recommendationId)

    const response = await $axios.post('/tracking/toggle', { recommendationId })
    const toggleResult = response.data as ITrackingToggleResponse

    todayTasks.value = todayTasks.value.map((item) => {
      if (item.recommendationId !== recommendationId) {
        return item
      }

      return {
        ...item,
        isCompleted: toggleResult.completed,
      }
    })

    await fetchMonthlyStats()
  } catch (error) {
    console.log(error)
    alert('Error al registrar el estado de la recomendacion.')
  } finally {
    togglingRecommendationIds.value = togglingRecommendationIds.value.filter(
      (id) => id !== recommendationId,
    )
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
    <v-container>
      <v-row>
        <v-col cols="12">
          <div class="my-4">
            <h1 class="handlee-regular text-h3 font-weight-regular">
              Vista calendario
            </h1>
          </div>
        </v-col>
      </v-row>

      <v-row>
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

      <v-row
        v-if="selectedCalendarDate && selectedDayCompletedCount > 0"
        class="mt-2"
      >
        <v-col cols="12">
          <v-card rounded="xl" :elevation="3" class="pa-4">
            <h3 class="text-h6 catamaran-regular font-weight-bold mb-2">
              Recomendaciones realizadas el {{ selectedDayLabel }}
            </h3>
            <ul class="pl-6">
              <li
                v-for="(recommendation, index) in selectedDayRecommendations"
                :key="`${recommendation}-${index}`"
                class="catamaran-regular mb-1"
              >
                {{ getShortRecommendation(recommendation, 50) }}
              </li>
            </ul>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-3">
        <v-col cols="12">
          <h2 class="handlee-regular text-h3 font-weight-regular">
            Para hoy...
          </h2>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          v-for="(recomendation, i) in todayTasks"
          :key="recomendation.recommendationId || i"
          cols="12"
          md="3"
        >
          <v-card
            rounded="xl"
            class="px-4 py-4 pt-5 d-none d-md-flex flex-column justify-space-between h-100"
            :elevation="5"
          >
            <div>
              <div class="mb-5 text-center">
                <span class="text-body-1 catamaran-regular font-weight-bold">
                  Basado en: {{ recomendation.category }}
                </span>
              </div>
              <div class="mb-7 text-center">
                <span class="text-body-1 catamaran-regular">
                  {{ recomendation.recommendation }}
                </span>
              </div>
            </div>
            <v-btn
              block
              color="greenShadow"
              class="catamaran-regular font-weight-bold"
              :disabled="
                recomendation.isCompleted ||
                isToggling(recomendation.recommendationId)
              "
              :loading="isToggling(recomendation.recommendationId)"
              @click="toggleRecommendation(recomendation.recommendationId)"
            >
              Hecho!
            </v-btn>
          </v-card>

          <v-expansion-panels class="d-md-none">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <div
                  class="w-100 d-flex align-center justify-space-between ga-2"
                >
                  <div class="d-flex flex-column">
                    <span
                      class="text-subtitle-2 catamaran-regular font-weight-bold"
                    >
                      Basado en: {{ recomendation.category }}
                    </span>
                    <span
                      class="text-body-2 catamaran-regular text-decoration-underline"
                    >
                      {{ getShortRecommendation(recomendation.recommendation, 50) }}
                    </span>
                  </div>
                  <v-btn
                    size="small"
                    color="greenShadow"
                    class="catamaran-regular font-weight-bold"
                    :disabled="
                      recomendation.isCompleted ||
                      isToggling(recomendation.recommendationId)
                    "
                    :loading="isToggling(recomendation.recommendationId)"
                    @click.stop="
                      toggleRecommendation(recomendation.recommendationId)
                    "
                  >
                    Hecho!
                  </v-btn>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <span class="text-body-2 catamaran-regular">
                  {{ recomendation.recommendation }}
                </span>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
