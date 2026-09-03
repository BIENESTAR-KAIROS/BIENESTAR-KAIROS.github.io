<script setup lang="ts">
import { NuxtLink } from '#components'
import { useAuthStore } from '~/store/auth'
import { useInstituteStore } from '~/store/institute'
import type { IDashboardStatisticsInstituteResponse } from '~/dto/response/institute/dashboard-statistics-institute.response.dto'

const { $axios } = useNuxtApp()
const authStore = useAuthStore()
const instituteStore = useInstituteStore()

const isLoading = ref(false)

const instituteIdForStats =
  authStore.user?.institute?._id || authStore.user?.institute

onMounted(async () => {
  try {
    isLoading.value = true

    const { data } = await $axios.get<IDashboardStatisticsInstituteResponse>(
      `/institute/${instituteIdForStats}/dashboard-statistics`,
    )

    instituteStore.statistics = data
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
})

const formatNumber = (value?: number) =>
  typeof value === 'number' ? value.toLocaleString('es-MX') : '—'

const initials = computed(() =>
  [authStore.user?.name, authStore.user?.lastName]
    .filter(Boolean)
    .map((part) => part!.charAt(0).toUpperCase())
    .join(''),
)

const activeShare = computed(() => {
  const { totalUsers, activeUsers } = instituteStore.statistics || {}

  if (!totalUsers || typeof activeUsers !== 'number') return null

  return `${Math.round((activeUsers / totalUsers) * 100)}% de la población`
})

const adminSlotsLabel = computed(() => {
  const slots = instituteStore.statistics?.adminSlotsAvailable

  if (typeof slots !== 'number') return null

  return slots === 1 ? '1 espacio libre' : `${slots} espacios libres`
})

const stats = computed(() => [
  {
    label: 'Total usuarios',
    value: formatNumber(instituteStore.statistics?.totalUsers),
  },
  {
    label: 'Activos',
    value: formatNumber(instituteStore.statistics?.activeUsers),
    note: activeShare.value,
  },
  {
    label: 'Estudiantes',
    value: formatNumber(instituteStore.statistics?.studentUsers),
    link: { to: '/institute/my-users', text: 'Ver detalles →' },
  },
  {
    label: 'Administradores',
    value: formatNumber(instituteStore.statistics?.administratorUsers),
    note: adminSlotsLabel.value,
  },
])
</script>

<template>
  <div class="institute-home">
    <header class="institute-home__header">
      <div class="institute-home__heading">
        <span class="institute-home__eyebrow">Inicio</span>
        <h1 class="institute-home__title">
          Bienvenida de nuevo, {{ authStore.user?.name }}
          {{ authStore.user?.lastName }}
        </h1>
      </div>
      <span v-if="initials" class="institute-home__avatar">{{ initials }}</span>
    </header>

    <div class="institute-home__body">
      <p class="institute-home__intro">
        Esta es la información general de tu población y sus parámetros, son
        aquellos detalles que Kairos considera que debes de saber de tu
        población, si quieres ver información a tu medida, accede a
        “Mis estadísticas”.
      </p>

      <div class="institute-home__grid">
        <component
          :is="stat.link ? NuxtLink : 'div'"
          v-for="stat in stats"
          :key="stat.label"
          :to="stat.link?.to"
          class="stat-card"
          :class="{ 'stat-card--link': stat.link }"
        >
          <span class="stat-card__label">{{ stat.label }}</span>
          <span class="stat-card__value">{{ stat.value }}</span>
          <span v-if="stat.link" class="stat-card__cta">
            {{ stat.link.text }}
          </span>
          <span v-else-if="stat.note" class="stat-card__note">
            {{ stat.note }}
          </span>
        </component>
      </div>
    </div>
  </div>
</template>

<style scoped>
.institute-home {
  min-height: 100%;
  background: #f5f4f8;
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
}

.institute-home__header {
  background: #fff;
  border-bottom: 1px solid #eae6f0;
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.institute-home__heading {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.institute-home__eyebrow {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9b8fb0;
}

.institute-home__title {
  margin: 0;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.institute-home__avatar {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 999px;
  background: #cbadd8;
  color: #3c2f52;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.institute-home__body {
  padding: 24px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.institute-home__intro {
  margin: 0;
  max-width: 780px;
  font-size: 15px;
  line-height: 1.6;
  color: #6b6080;
}

.institute-home__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.stat-card {
  background: #fff;
  border: 1px solid #efebf5;
  border-radius: 20px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-height: 104px;
  text-decoration: none;
  color: inherit;
}

.stat-card--link:hover {
  border-color: #8475a0;
}

.stat-card__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9b8fb0;
}

.stat-card__value {
  font-size: 26px;
  font-weight: 800;
  line-height: 1;
}

.stat-card__note {
  font-size: 12px;
  color: #7d7391;
}

.stat-card__cta {
  font-size: 12px;
  font-weight: 700;
  color: #8475a0;
}

@media (max-width: 1100px) {
  .institute-home__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .institute-home__header,
  .institute-home__body {
    padding-left: 20px;
    padding-right: 20px;
  }

  .institute-home__grid {
    grid-template-columns: 1fr;
  }
}
</style>
