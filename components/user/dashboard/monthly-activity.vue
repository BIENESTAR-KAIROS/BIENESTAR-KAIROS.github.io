<script setup lang="ts">
import type { ITrackingMonthlyStatsResponse } from '~/interfaces/tracking/tracking-stats.interface'

const { $axios } = useNuxtApp()

const now = new Date()
const month = now.getMonth() + 1
const year = now.getFullYear()

const completedByDay = ref<Record<number, number>>({})
const isLoading = ref(false)

const monthLabel = computed(() =>
  now.toLocaleDateString('es-MX', { month: 'long' }).replace(/^\w/, (c) => c.toUpperCase()),
)

const daysInMonth = computed(() => new Date(year, month, 0).getDate())

const activeDaysCount = computed(
  () => Object.values(completedByDay.value).filter((count) => count > 0).length,
)

const days = computed(() =>
  Array.from({ length: daysInMonth.value }, (_, i) => {
    const day = i + 1
    return { day, count: completedByDay.value[day] ?? 0 }
  }),
)

function colorForCount(count: number): string {
  if (count <= 0) return '#eef4f5'
  if (count === 1) return '#DBF2F4'
  if (count === 2) return '#6CC5CB'
  if (count === 3) return '#07979F'
  return '#065C5D'
}

async function fetchMonthlyStats() {
  try {
    isLoading.value = true
    const response = await $axios.get<ITrackingMonthlyStatsResponse>('/tracking/stats', {
      params: { month, year },
    })

    completedByDay.value = response.data.completedByDay.reduce(
      (acc, item) => {
        acc[item.day] = item.count
        return acc
      },
      {} as Record<number, number>,
    )
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchMonthlyStats)

defineExpose({ refresh: fetchMonthlyStats })
</script>

<template>
  <div class="monthly-activity">
    <div class="monthly-activity__header">
      <span class="monthly-activity__month">{{ monthLabel }}</span>
      <span class="monthly-activity__count">
        {{ activeDaysCount }} de {{ daysInMonth }} días activos
      </span>
    </div>
    <div class="monthly-activity__grid">
      <span
        v-for="item in days"
        :key="item.day"
        class="monthly-activity__cell"
        :style="{ background: colorForCount(item.count) }"
        :title="`${item.day}: ${item.count} recomendaciones completadas`"
      />
    </div>
  </div>
</template>

<style scoped>
.monthly-activity {
  background: #fff;
  border-radius: 24px;
  padding: 22px;
  border: 1px solid #eaf1f2;
}

.monthly-activity__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.monthly-activity__month {
  font-size: 16px;
  font-weight: 700;
}

.monthly-activity__count {
  font-size: 12px;
  color: #5f767e;
}

.monthly-activity__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 7px;
}

.monthly-activity__cell {
  aspect-ratio: 1;
  border-radius: 9px;
  transition: background-color 0.2s ease;
}
</style>
