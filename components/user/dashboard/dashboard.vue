<script setup lang="ts">
import { NuxtLink } from '#components'
import { useAuthStore } from '~/store/auth'
import { getApiErrorMessage } from '~/utils/helpers/http-errors'
import CheckInCard from './check-in-card.vue'
import TodayTasks from './today-tasks.vue'
import WellbeingCard from './wellbeing-card.vue'
import MonthlyActivity from './monthly-activity.vue'
import NextAppointmentCard from './next-appointment-card.vue'
import type {
  MoodEnum,
  ICheckInSummary,
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

async function fetchCheckInSummary() {
  try {
    const response = await $axios.get<ICheckInSummary>('/check-in/summary')
    checkInSummary.value = response.data
  } catch (error) {
    console.error(error)
  }
}

async function submitCheckIn(mood: MoodEnum) {
  try {
    isSubmittingCheckIn.value = true
    const response = await $axios.post<ICheckInSummary>('/check-in', { mood })
    checkInSummary.value = response.data
  } catch (error: unknown) {
    console.error(error)
    alert(getApiErrorMessage(error, 'No pudimos registrar tu check-in.'))
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
    console.error(error)
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
    console.error(error)
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
        <h1 class="dashboard__title">Buen día, {{ firstName }}</h1>
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
      <section class="dashboard__area" aria-labelledby="dashboard-know-title">
        <header class="dashboard__area-header">
          <span class="dashboard__area-icon" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="8" y="2" width="8" height="4" rx="1" />
              <path
                d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 12h6M9 16h4"
              />
            </svg>
          </span>
          <div>
            <h2 id="dashboard-know-title" class="dashboard__area-title">
              Queremos conocerte
            </h2>
            <p class="dashboard__area-subtitle">
              Tu estado de ánimo y tu bienestar.
            </p>
          </div>
        </header>

        <div class="dashboard__know-grid">
          <div class="dashboard__know-summary">
            <NuxtLink to="/user/quiz" class="resource-card">
              <div class="resource-card__copy">
                <span class="resource-card__badge">5 min</span>
                <h3 class="resource-card__title">Cuestionarios</h3>
                <p class="resource-card__subtitle">Cuéntanos más sobre ti.</p>
                <span class="resource-card__action"
                  >Ir a cuestionarios <span aria-hidden="true">→</span></span
                >
              </div>
              <img
                src="/image-dashboard-16.png"
                alt=""
                class="resource-card__image"
              />
            </NuxtLink>
            <WellbeingCard
              :summary="checkInSummary"
              class="dashboard__wellbeing"
            />
          </div>
          <CheckInCard
            :summary="checkInSummary"
            :is-submitting="isSubmittingCheckIn"
            @submit="submitCheckIn"
          />
        </div>
      </section>

      <section class="dashboard__area" aria-labelledby="dashboard-help-title">
        <header class="dashboard__area-header">
          <span
            class="dashboard__area-icon dashboard__area-icon--help"
            aria-hidden="true"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z"
              />
            </svg>
          </span>
          <div>
            <h2 id="dashboard-help-title" class="dashboard__area-title">
              Queremos ayudarte
            </h2>
            <p class="dashboard__area-subtitle">
              Acciones y apoyo para tu día a día.
            </p>
          </div>
        </header>

        <div class="dashboard__help-grid">
          <section
            class="dashboard__tasks"
            aria-labelledby="dashboard-tasks-title"
          >
            <h3 id="dashboard-tasks-title" class="dashboard__tasks-title">
              Tus tareas de hoy
            </h3>
            <TodayTasks
              :tasks="todayTasks"
              :toggling-ids="togglingTaskIds"
              @toggle="toggleTask"
            />
          </section>
          <div class="dashboard__help-resources">
            <NuxtLink
              to="/user/get-help"
              class="resource-card resource-card--help"
            >
              <div class="resource-card__copy">
                <span class="resource-card__badge">4 recursos</span>
                <h3 class="resource-card__title">Prácticas y especialistas</h3>
                <p class="resource-card__subtitle">
                  Explora el apoyo disponible para ti.
                </p>
                <span class="resource-card__action"
                  >Explorar recursos <span aria-hidden="true">→</span></span
                >
              </div>
              <img
                src="/image-dashboard-19.png"
                alt=""
                class="resource-card__image"
              />
            </NuxtLink>
            <MonthlyActivity ref="monthlyActivityRef" />
          </div>
          <NextAppointmentCard class="dashboard__appointment" />
        </div>
      </section>
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
  gap: 28px;
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
  margin: 0;
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
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.dashboard__area {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.dashboard__area-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dashboard__area-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 14px;
  background: #dbf2f4;
  color: #065c5d;
}

.dashboard__area-icon--help {
  background: #f0eaf5;
  color: #5c4a75;
}

.dashboard__area-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.dashboard__area-subtitle {
  margin: 4px 0 0;
  color: #5c7078;
  font-size: 14px;
}

.dashboard__know-grid,
.dashboard__help-grid {
  display: grid;
  gap: 20px;
  min-width: 0;
}

.dashboard__know-grid {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
}

.dashboard__help-grid {
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
}

.dashboard__know-summary,
.dashboard__help-resources {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.dashboard__wellbeing {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: end;
  column-gap: 16px;
}

.dashboard__wellbeing :deep(.wellbeing-card__title),
.dashboard__wellbeing :deep(.wellbeing-card__delta) {
  grid-column: 1 / -1;
}

.dashboard__wellbeing :deep(.wellbeing-card__delta) {
  grid-row: 3;
  margin-top: 8px;
}

.dashboard__wellbeing :deep(.wellbeing-card__bars) {
  grid-column: 2;
  grid-row: 2;
  height: 44px;
  margin-top: 0;
}

.dashboard__tasks {
  display: flex;
  flex-direction: column;
  /* Let the resources column set the row height, regardless of task count. */
  contain: size;
  background: #fff;
  border: 1px solid #eaf1f2;
  border-radius: 24px;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.dashboard__tasks-title {
  flex-shrink: 0;
  margin: 0;
  padding: 22px;
  font-size: 18px;
  font-weight: 700;
}

.dashboard__tasks :deep(.today-tasks) {
  border: 0;
  border-top: 1px solid #eaf1f2;
  border-radius: 0;
}

.dashboard__tasks :deep(.today-tasks__row) {
  flex-wrap: wrap;
}

.dashboard__tasks :deep(.today-tasks__copy) {
  flex-basis: 160px;
  overflow-wrap: anywhere;
}

.dashboard__tasks :deep(.today-tasks__mark) {
  margin-left: auto;
}

.dashboard__appointment {
  grid-column: 1 / -1;
}

.dashboard__help-resources :deep(.monthly-activity__header) {
  flex-wrap: wrap;
  gap: 8px;
}

.resource-card {
  background: #fff;
  border-radius: 24px;
  padding: 20px;
  min-height: 144px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 6px 20px -12px rgba(6, 92, 93, 0.35);
  border: 1px solid #eaf1f2;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s ease;
}

.resource-card:hover {
  border-color: #07979f;
}

.resource-card:focus-visible {
  outline: 3px solid #065c5d;
  outline-offset: 3px;
}

.resource-card__copy {
  min-width: 0;
}

.resource-card__badge {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  margin-bottom: 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: #dbf2f4;
  color: #065c5d;
}

.resource-card--help .resource-card__badge {
  background: #f0eaf5;
  color: #5c4a75;
}

.resource-card__image {
  width: 78px;
  height: 78px;
  flex: 0 0 78px;
  object-fit: contain;
}

.resource-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #0e2a36;
}

.resource-card__subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #5c7078;
}

.resource-card__action {
  display: block;
  margin-top: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #065c5d;
}

@media (max-width: 1180px) {
  .dashboard__tasks {
    contain: none;
  }

  .dashboard__know-grid,
  .dashboard__help-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 720px) {
  .dashboard {
    padding: 20px 18px 40px;
  }

  .dashboard__area-title {
    font-size: 20px;
  }
}
</style>
