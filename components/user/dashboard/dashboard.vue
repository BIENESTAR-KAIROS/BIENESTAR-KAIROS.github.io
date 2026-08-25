<script setup lang="ts">
import { NuxtLink } from '#components'
import { useAuthStore } from '~/store/auth'
import CheckInCard from './check-in-card.vue'
import TodayTasks from './today-tasks.vue'
import WellbeingCard from './wellbeing-card.vue'
import MonthlyActivity from './monthly-activity.vue'
import NextAppointmentCard from './next-appointment-card.vue'
import {
  MoodEnum,
  type ICheckInSummary,
} from '~/interfaces/checkin/check-in.interface'
import type { ITrackingTask } from '~/interfaces/tracking/tracking-task.interface'
import type { ITrackingToggleResponse } from '~/interfaces/tracking/tracking-toggle.interface'

const { $axios } = useNuxtApp()
const authStore = useAuthStore()

const checkInSummary = ref<ICheckInSummary | null>(null)
const isSubmittingCheckIn = ref(false)

const todayTasks = ref<ITrackingTask[]>([])
const togglingTaskIds = ref<string[]>([])
const monthlyActivityRef = ref<{ refresh: () => Promise<void> } | null>(null)

const today = new Date()

const dateLabel = computed(() =>
  today
    .toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    .replace(/^\w/, (c) => c.toUpperCase()),
)

const firstName = computed(() => authStore.user?.name || '')

const initials = computed(() => {
  const name = authStore.user?.name?.[0] || ''
  const lastName = authStore.user?.lastName?.[0] || ''
  return `${name}${lastName}`.toUpperCase()
})

const pendingTasksCount = computed(
  () => todayTasks.value.filter((task) => !task.isCompleted).length,
)

const forYouCards = computed(() => [
  {
    title: 'Queremos conocerte',
    subtitle: 'Cuestionarios varios',
    to: '/user/quiz',
    image: '/image-dashboard-16.png',
    badge: '5 min',
    badgeColor: '#DBF2F4',
    badgeTextColor: '#065C5D',
  },
  {
    title: 'Queremos ayudarte',
    subtitle: 'Prácticas y especialistas',
    to: '/user/get-help',
    image: '/image-dashboard-19.png',
    badge: '3 recursos',
    badgeColor: '#F0EAF5',
    badgeTextColor: '#5c4a75',
  },
  {
    title: 'Recomendaciones',
    subtitle: 'Tus tareas de hoy',
    to: '/user/recomendations',
    image: '/image-dashboard-20.png',
    badge:
      pendingTasksCount.value > 0
        ? `${pendingTasksCount.value} pendientes`
        : 'Sin pendientes',
    badgeColor: '#DBF2F4',
    badgeTextColor: '#065C5D',
  },
])

async function fetchCheckInSummary() {
  try {
    const response = await $axios.get<ICheckInSummary>('/check-in/summary')
    checkInSummary.value = response.data
  } catch (error) {
    console.log(error)
  }
}

async function submitCheckIn(mood: MoodEnum) {
  try {
    isSubmittingCheckIn.value = true
    const response = await $axios.post<ICheckInSummary>('/check-in', { mood })
    checkInSummary.value = response.data
  } catch (error: any) {
    console.log(error)
    alert(error?.response?.data?.message || 'No pudimos registrar tu check-in.')
    // A rejected attempt (e.g. cooldown) may still mean the summary is stale.
    await fetchCheckInSummary()
  } finally {
    isSubmittingCheckIn.value = false
  }
}

async function fetchTodayTasks() {
  try {
    const response = await $axios.get<ITrackingTask[]>('/tracking/today')
    todayTasks.value = response.data
  } catch (error) {
    console.log(error)
  }
}

async function toggleTask(recommendationId: string) {
  try {
    togglingTaskIds.value.push(recommendationId)
    const response = await $axios.post<ITrackingToggleResponse>(
      '/tracking/toggle',
      {
        recommendationId,
      },
    )

    todayTasks.value = todayTasks.value.map((task) =>
      task.recommendationId === recommendationId
        ? { ...task, isCompleted: response.data.completed }
        : task,
    )

    await monthlyActivityRef.value?.refresh()
  } catch (error) {
    console.log(error)
    alert('No pudimos actualizar esa tarea.')
  } finally {
    togglingTaskIds.value = togglingTaskIds.value.filter(
      (id) => id !== recommendationId,
    )
  }
}

onMounted(async () => {
  await Promise.all([fetchCheckInSummary(), fetchTodayTasks()])
})
</script>

<template>
  <div class="dashboard">
    <header class="dashboard__header">
      <div class="dashboard__greeting">
        <span class="dashboard__date">{{ dateLabel }}</span>
        <span class="dashboard__title">Buen día, {{ firstName }}</span>
      </div>
      <div class="dashboard__header-actions">
        <span
          v-if="checkInSummary && checkInSummary.streakDays > 0"
          class="dashboard__streak"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M12 3l1.9 4.6 4.6 1.9-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"
            />
          </svg>
          Racha de {{ checkInSummary.streakDays }}
          {{ checkInSummary.streakDays === 1 ? 'día' : 'días' }}
        </span>
        <span class="dashboard__avatar">{{ initials }}</span>
      </div>
    </header>

    <div class="dashboard__body">
      <CheckInCard
        :summary="checkInSummary"
        :is-submitting="isSubmittingCheckIn"
        @submit="submitCheckIn"
      />

      <section class="dashboard__main-column">
        <span class="dashboard__section-title">Para ti hoy</span>
        <div class="dashboard__for-you">
          <NuxtLink
            v-for="card in forYouCards"
            :key="card.to"
            :to="card.to"
            class="for-you-card"
          >
            <span
              class="for-you-card__badge"
              :style="{
                background: card.badgeColor,
                color: card.badgeTextColor,
              }"
            >
              {{ card.badge }}
            </span>
            <img :src="card.image" alt="" class="for-you-card__image" />
            <div class="for-you-card__copy">
              <span class="for-you-card__title">{{ card.title }}</span>
              <span class="for-you-card__subtitle">{{ card.subtitle }}</span>
            </div>
          </NuxtLink>
        </div>

        <span class="dashboard__section-title dashboard__section-title--spaced">
          Tus tareas de hoy
        </span>
        <TodayTasks
          :tasks="todayTasks"
          :toggling-ids="togglingTaskIds"
          @toggle="toggleTask"
        />
      </section>

      <aside class="dashboard__side-column">
        <WellbeingCard :summary="checkInSummary" />
        <MonthlyActivity ref="monthlyActivityRef" />
        <NextAppointmentCard />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
  background: #f4f8f9;
  min-height: 100vh;
  padding: 24px 36px 48px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dashboard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.dashboard__greeting {
  display: flex;
  flex-direction: column;
}

.dashboard__date {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5f767e;
}

.dashboard__title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.dashboard__header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.dashboard__streak {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  background: #dbf2f4;
  color: #065c5d;
  font-size: 13px;
  font-weight: 700;
}

.dashboard__avatar {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: #8475a0;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
}

.dashboard__body {
  display: grid;
  grid-template-columns: 1fr 344px;
  gap: 20px;
  align-items: start;
}

.dashboard__main-column {
  grid-column: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dashboard__side-column {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dashboard__section-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5f767e;
}

.dashboard__section-title--spaced {
  margin-top: 8px;
}

.dashboard__for-you {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.for-you-card {
  background: #fff;
  border-radius: 24px;
  padding: 20px;
  min-height: 196px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 6px 20px -12px rgba(6, 92, 93, 0.35);
  border: 1px solid #eaf1f2;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s ease;
}

.for-you-card:hover {
  border-color: #6cc5cb;
}

.for-you-card__badge {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  align-self: flex-start;
}

.for-you-card__image {
  width: 78px;
  height: 78px;
  object-fit: contain;
  align-self: center;
}

.for-you-card__copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.for-you-card__title {
  font-size: 16px;
  font-weight: 700;
  color: #0e2a36;
}

.for-you-card__subtitle {
  font-size: 13px;
  color: #5c7078;
}

@media (max-width: 1180px) {
  .dashboard__body {
    grid-template-columns: 1fr;
  }

  .dashboard__side-column {
    grid-column: 1;
  }
}

@media (max-width: 720px) {
  .dashboard {
    padding: 20px 18px 40px;
  }

  .dashboard__for-you {
    grid-template-columns: 1fr;
  }
}
</style>
