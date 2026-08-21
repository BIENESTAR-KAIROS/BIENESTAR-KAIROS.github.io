<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import CalendarRecomendations from './calendar-recomendations.vue'
import type { ITrackingTask } from '~/interfaces/tracking/tracking-task.interface'
import type { ITrackingMonthlyStatsResponse } from '~/interfaces/tracking/tracking-stats.interface'
import type { ITrackingToggleResponse } from '~/interfaces/tracking/tracking-toggle.interface'
import { useAuthStore } from '~/store/auth'

const { $axios } = useNuxtApp()
const authStore = useAuthStore()

const isLoading = ref(false)
const tasks = ref<ITrackingTask[]>([])
const togglingIds = ref<string[]>([])
const activeDaysCount = ref(0)

const today = new Date()
const daysInMonth = computed(
  () => new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(),
)

const isToggling = (id: string) => togglingIds.value.includes(id)

async function fetchTodayTasks() {
  if (!authStore.user) return
  const response = await $axios.get<ITrackingTask[]>('/tracking/today')
  tasks.value = response.data
}

async function fetchMonthlyStreak() {
  const response = await $axios.get<ITrackingMonthlyStatsResponse>(
    '/tracking/stats',
    { params: { month: today.getMonth() + 1, year: today.getFullYear() } },
  )
  activeDaysCount.value = response.data.completedByDay.filter(
    (day) => day.count > 0,
  ).length
}

async function toggleTask(recommendationId: string) {
  try {
    togglingIds.value.push(recommendationId)
    const response = await $axios.post<ITrackingToggleResponse>(
      '/tracking/toggle',
      { recommendationId },
    )

    tasks.value = tasks.value.map((task) =>
      task.recommendationId === recommendationId
        ? { ...task, isCompleted: response.data.completed }
        : task,
    )

    await fetchMonthlyStreak()
  } catch (error) {
    console.log(error)
    alert('No pudimos actualizar esa recomendación.')
  } finally {
    togglingIds.value = togglingIds.value.filter(
      (id) => id !== recommendationId,
    )
  }
}

onMounted(async () => {
  try {
    isLoading.value = true
    await Promise.all([fetchTodayTasks(), fetchMonthlyStreak()])
  } catch (error) {
    console.log(error)
    alert('Error al cargar tus recomendaciones de hoy.')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="custom-recomendations">
    <div v-if="isLoading" class="custom-recomendations__loading">
      <v-progress-circular color="primary" indeterminate />
    </div>

    <div v-else class="custom-recomendations__grid">
      <div class="custom-recomendations__tasks">
        <div v-if="tasks.length === 0" class="custom-recomendations__empty">
          Todavía no tienes recomendaciones asignadas para hoy.
        </div>

        <div
          v-for="task in tasks"
          :key="task.recommendationId"
          class="task-card"
        >
          <button
            type="button"
            class="task-card__check"
            :class="{ 'task-card__check--done': task.isCompleted }"
            :disabled="isToggling(task.recommendationId)"
            @click="toggleTask(task.recommendationId)"
          >
            <svg
              v-if="task.isCompleted"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              stroke-width="3.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 13l4 4 10-10" />
            </svg>
          </button>
          <div class="task-card__copy">
            <span class="task-card__category">{{ task.category }}</span>
            <span
              class="task-card__label"
              :class="{ 'task-card__label--done': task.isCompleted }"
            >
              {{ task.recommendation }}
            </span>
          </div>
          <span v-if="task.isCompleted" class="task-card__status">
            Hecho hoy
          </span>
          <button
            v-else
            type="button"
            class="task-card__mark"
            :disabled="isToggling(task.recommendationId)"
            :class="{ 'task-card__mark--loading': isToggling(task.recommendationId) }"
            @click="toggleTask(task.recommendationId)"
          >
            ¡Hecho!
          </button>
        </div>

        <div class="streak-banner">
          <img src="/image-dashboard-20.png" alt="" class="streak-banner__icon" />
          <div class="streak-banner__copy">
            <span class="streak-banner__title">
              Llevas {{ activeDaysCount }} de {{ daysInMonth }} días con al
              menos una tarea
            </span>
            <span class="streak-banner__subtitle">
              La constancia importa más que hacerlas todas.
            </span>
          </div>
        </div>
      </div>

      <CalendarRecomendations />
    </div>
  </div>
</template>

<style scoped>
.custom-recomendations__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}

.custom-recomendations__grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  align-items: start;
}

.custom-recomendations__tasks {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.custom-recomendations__empty {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  padding: 22px;
  font-size: 14px;
  color: #5f767e;
}

.task-card {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.task-card__check {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border-radius: 999px;
  border: 2px solid #cfdde1;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.task-card__check--done {
  border: 0;
  background: #065c5d;
}

.task-card__copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.task-card__category {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b8189;
}

.task-card__label {
  font-size: 16px;
  font-weight: 600;
}

.task-card__label--done {
  color: #5f767e;
  text-decoration: line-through;
}

.task-card__status {
  font-size: 13px;
  font-weight: 700;
  color: #065c5d;
  flex: 0 0 auto;
}

.task-card__mark {
  height: 40px;
  padding: 0 20px;
  border-radius: 999px;
  border: 0;
  background: #065c5d;
  color: #fff;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  flex: 0 0 auto;
  transition: background-color 0.15s ease;
}

.task-card__mark:hover:not(:disabled) {
  background: #07979f;
}

.task-card__mark:disabled,
.task-card__check:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.streak-banner {
  background: #dbf2f4;
  border-radius: 24px;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.streak-banner__icon {
  width: 56px;
  height: 56px;
  object-fit: contain;
  flex: 0 0 56px;
}

.streak-banner__copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.streak-banner__title {
  font-size: 16px;
  font-weight: 800;
  color: #04494a;
}

.streak-banner__subtitle {
  font-size: 14px;
  color: #0b6f70;
}

@media (max-width: 1180px) {
  .custom-recomendations__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .task-card {
    padding: 18px;
    gap: 14px;
  }

  .task-card__label {
    font-size: 15px;
  }
}
</style>
