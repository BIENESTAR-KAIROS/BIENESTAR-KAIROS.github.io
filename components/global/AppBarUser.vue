<script setup lang="ts">
import { NuxtLink } from '#components'
import { useAppStore } from '~/store/app'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '~/store/auth'
import { UserRolEnum } from '~/interfaces/user/enum/user-rol.enum'

const { $router } = useNuxtApp()
const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()
const { mobile } = useDisplay()

const spaceLinks = [
  { title: 'Inicio', to: '/user/dashboard', icon: 'home' },
  { title: 'Cuestionarios', to: '/user/quiz', icon: 'clipboard' },
  { title: 'Queremos ayudarte', to: '/user/get-help', icon: 'heart' },
  { title: 'Recomendaciones', to: '/user/recomendations', icon: 'star' },
]

const accountLinks = [
  { title: 'Mi perfil', to: '/user/profile', icon: 'profile' },
  { title: 'Mi historial', to: '/user/history', icon: 'history' },
  { title: 'Aviso de privacidad', to: '/user/privacy-policy', icon: 'shield' },
]

const updateNavBarState = (value: boolean) => {
  appStore.isNavBarOpen = value
}

let roles = authStore.user?.roles || []

const isOpen = computed(() => appStore.isNavBarOpen)

const isActive = (to: string) => route.path.startsWith(to)

const institute = computed(() => authStore.user?.institute)

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

onMounted(async () => {
  if (!mobile.value) updateNavBarState(true)

  roles = authStore.user?.roles || []
})
</script>

<template>
  <v-navigation-drawer
    :width="272"
    class="kairos-nav"
    :model-value="isOpen"
    @update:model-value="updateNavBarState"
  >
    <div class="kairos-nav__inner">
      <NuxtLink href="/user/dashboard" class="kairos-nav__brand">
        <span class="kairos-nav__brand-mark">
          <v-img src="/logo-white.png" width="34" height="34" />
        </span>
        <span class="kairos-nav__brand-copy">
          <span class="kairos-nav__brand-title">Kairos</span>
          <span class="kairos-nav__brand-subtitle">bienestar mental</span>
        </span>
      </NuxtLink>

      <nav class="kairos-nav__nav">
        <span class="kairos-nav__group-title">Tu espacio</span>
        <NuxtLink
          v-for="link in spaceLinks"
          :key="link.to"
          :to="link.to"
          class="kairos-nav__item"
          :class="{ 'kairos-nav__item--active': isActive(link.to) }"
        >
          <span class="kairos-nav__icon">
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
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <path d="M9 12h6M9 16h4" />
            </svg>
            <svg
              v-else-if="link.icon === 'heart'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z"
              />
            </svg>
            <svg
              v-else-if="link.icon === 'star'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 3l1.9 4.6 4.6 1.9-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" />
              <path d="M18 17l.9 2.1L21 20l-2.1.9L18 23l-.9-2.1L15 20l2.1-.9z" />
            </svg>
          </span>
          {{ link.title }}
        </NuxtLink>

        <span class="kairos-nav__group-title">Cuenta</span>
        <NuxtLink
          v-for="link in accountLinks"
          :key="link.to"
          :to="link.to"
          class="kairos-nav__item"
          :class="{ 'kairos-nav__item--active': isActive(link.to) }"
        >
          <span class="kairos-nav__icon">
            <svg
              v-if="link.icon === 'profile'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
            </svg>
            <svg
              v-else-if="link.icon === 'history'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l4 2" />
            </svg>
            <svg
              v-else-if="link.icon === 'shield'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 3l8 3v6c0 5-3.5 8.2-8 9-4.5-.8-8-4-8-9V6z" />
            </svg>
          </span>
          {{ link.title }}
        </NuxtLink>

        <template
          v-if="
            roles.find(
              (rol: UserRolEnum) =>
                rol === UserRolEnum.INSTITUTION_ADMIN ||
                rol === UserRolEnum.INSTITUTION_STAFF ||
                rol === UserRolEnum.KAIROS_ADMIN,
            )
          "
        >
          <span class="kairos-nav__group-title">Institución</span>
          <NuxtLink to="/institute/dashboard" class="kairos-nav__item">
            Vista de instituto
          </NuxtLink>
          <NuxtLink
            v-if="roles.find((rol: UserRolEnum) => rol === UserRolEnum.KAIROS_ADMIN)"
            to="/admin/dashboard"
            class="kairos-nav__item"
          >
            Vista de administrador
          </NuxtLink>
        </template>
      </nav>

      <div class="kairos-nav__footer">
        <div class="kairos-nav__sos">
          <span class="kairos-nav__sos-title">¿Necesitas hablar hoy?</span>
          <span class="kairos-nav__sos-copy">
            {{ institute?.name || 'Tu institución' }}
            <template v-if="institute?.phoneNumber"> · {{ institute.phoneNumber }}</template>
          </span>
        </div>
        <button type="button" class="kairos-nav__logout" @click="logout">
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
.kairos-nav {
  background: #065c5d !important;
  border-top-right-radius: 32px;
}

.kairos-nav__inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 22px 16px;
  gap: 22px;
  font-family: 'Figtree', sans-serif;
  color: #fff;
}

.kairos-nav__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
  text-decoration: none;
  color: inherit;
}

.kairos-nav__brand-mark {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: #0b7273;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 48px;
}

.kairos-nav__brand-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.kairos-nav__brand-title {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.kairos-nav__brand-subtitle {
  font-size: 12px;
  color: #9fd7d8;
}

.kairos-nav__nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
}

.kairos-nav__group-title {
  padding: 14px 12px 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7fc4c5;
}

.kairos-nav__group-title:first-child {
  padding-top: 0;
}

.kairos-nav__item {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 46px;
  padding: 0 14px;
  border-radius: 999px;
  color: #dff1f1;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.kairos-nav__item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.kairos-nav__item--active {
  background: #fff;
  color: #065c5d;
  font-weight: 700;
}

.kairos-nav__icon {
  display: inline-flex;
  flex: 0 0 20px;
}

.kairos-nav__footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.kairos-nav__sos {
  background: #0b7273;
  border-radius: 20px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kairos-nav__sos-title {
  font-size: 13px;
  font-weight: 700;
}

.kairos-nav__sos-copy {
  font-size: 12px;
  line-height: 1.5;
  color: #c7e9ea;
}

.kairos-nav__logout {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #bfe4e4;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
}

.kairos-nav__logout:hover {
  background: rgba(255, 255, 255, 0.08);
}
</style>
