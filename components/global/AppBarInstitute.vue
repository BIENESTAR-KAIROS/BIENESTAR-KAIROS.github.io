<script setup lang="ts">
import { useAppStore } from '~/store/app'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '~/store/auth'
import { UserRolEnum } from '~/interfaces/user/enum/user-rol.enum'

const { $router } = useNuxtApp()
const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()
const { mobile } = useDisplay()

const navLinks = [
  { title: 'Inicio', to: '/institute/dashboard', icon: 'home' },
  { title: 'Mis usuarios', to: '/institute/my-users', icon: 'users' },
  { title: 'Mis estadísticas', to: '/institute/stats', icon: 'chart' },
  { title: 'Mis cuestionarios', to: '/institute/quizzes', icon: 'clipboard' },
]

const updateNavBarState = (value: boolean) => {
  appStore.isNavBarOpen = value
}

let roles = authStore.user?.roles || []

const isOpen = computed(() => appStore.isNavBarOpen)

const isActive = (to: string) => route.path.startsWith(to)

const institute = computed(() => authStore.user?.institute)

const campus = computed(() => institute.value?.campuses?.[0]?.name)

watch(mobile, () => {
  if (isOpen.value && mobile.value) {
    appStore.isNavBarOpen = false
  }
})

async function logout() {
  try {
    authStore.clearAuth()
    $router.push('/')
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  if (!mobile.value) updateNavBarState(true)

  roles = authStore.user?.roles || []
})
</script>

<template>
  <v-navigation-drawer
    :width="272"
    class="institute-nav"
    :model-value="isOpen"
    @update:model-value="updateNavBarState"
  >
    <div class="institute-nav__inner">
      <NuxtLink href="/institute/dashboard" class="institute-nav__brand">
        <span class="institute-nav__brand-mark">
          <v-img src="/logo-white.png" width="34" height="34" />
        </span>
        <span class="institute-nav__brand-copy">
          <span class="institute-nav__brand-title">Kairos</span>
          <span class="institute-nav__brand-subtitle">Panel de instituto</span>
        </span>
      </NuxtLink>

      <div v-if="institute" class="institute-nav__org">
        <span class="institute-nav__org-label">Institución</span>
        <span class="institute-nav__org-name">{{ institute.name }}</span>
        <span v-if="campus" class="institute-nav__org-campus">{{ campus }}</span>
      </div>

      <nav class="institute-nav__nav">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="institute-nav__item"
          :class="{ 'institute-nav__item--active': isActive(link.to) }"
        >
          <span class="institute-nav__icon">
            <svg
              v-if="link.icon === 'home'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
              <path d="M9 21v-7h6v7" />
            </svg>
            <svg
              v-else-if="link.icon === 'users'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="9" cy="8" r="3.5" />
              <path d="M2.5 21c0-3.6 2.9-5.5 6.5-5.5s6.5 1.9 6.5 5.5" />
              <path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18 15.8c2.1.7 3.5 2.3 3.5 5.2" />
            </svg>
            <svg
              v-else-if="link.icon === 'chart'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
            </svg>
            <svg
              v-else-if="link.icon === 'clipboard'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="8" y="2" width="8" height="4" rx="1" />
              <path
                d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
              />
              <path d="M9 12h6M9 16h4" />
            </svg>
          </span>
          {{ link.title }}
        </NuxtLink>
      </nav>

      <div class="institute-nav__footer">
        <NuxtLink
          v-if="roles.find((rol: UserRolEnum) => rol === UserRolEnum.KAIROS_ADMIN)"
          to="/admin/dashboard"
          class="institute-nav__switch"
        >
          Vista de administrador
        </NuxtLink>
        <NuxtLink to="/user/dashboard" class="institute-nav__switch">
          Ver como alumno
        </NuxtLink>
        <button type="button" class="institute-nav__logout" @click="logout">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <path d="M10 17l-5-5 5-5M5 12h11" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.institute-nav {
  background: #3c2f52 !important;
  border-top-right-radius: 32px;
}

.institute-nav__inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 22px 16px;
  gap: 18px;
  font-family: 'Figtree', sans-serif;
  color: #fff;
}

.institute-nav__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
  text-decoration: none;
  color: inherit;
}

.institute-nav__brand-mark {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: #523f6e;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 48px;
}

.institute-nav__brand-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.institute-nav__brand-title {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.institute-nav__brand-subtitle {
  font-size: 12px;
  color: #c3b6d8;
}

.institute-nav__org {
  background: #523f6e;
  border-radius: 20px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.institute-nav__org-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #c3b6d8;
}

.institute-nav__org-name {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
}

.institute-nav__org-campus {
  font-size: 12px;
  color: #c3b6d8;
}

.institute-nav__nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
}

.institute-nav__item {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 46px;
  padding: 0 14px;
  border-radius: 999px;
  color: #e6dff0;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.institute-nav__item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.institute-nav__item--active {
  background: #fff;
  color: #3c2f52;
  font-weight: 700;
}

.institute-nav__icon {
  display: inline-flex;
  flex: 0 0 20px;
}

.institute-nav__footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.institute-nav__switch {
  display: flex;
  align-items: center;
  height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  background: #523f6e;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.institute-nav__switch:hover {
  background: #614c80;
}

.institute-nav__logout {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #cfc3e0;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
}

.institute-nav__logout:hover {
  background: rgba(255, 255, 255, 0.08);
}
</style>
