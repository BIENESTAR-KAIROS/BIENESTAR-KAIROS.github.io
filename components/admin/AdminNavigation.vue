<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { useAuthStore } from '~/store/auth'

const { smAndDown } = useDisplay()
const auth = useAuthStore()
const route = useRoute()
// Admin navigation has local state and never writes to the other layouts' drawer store.
const isOpen = ref(!smAndDown.value)
const menuButton = ref<HTMLButtonElement | null>(null)
const signingOut = ref(false)
const logoutError = ref('')
const active = computed(() => route.path.startsWith('/admin/recommendations'))

watch(smAndDown, (compact) => {
  isOpen.value = !compact
})
watch(
  () => route.fullPath,
  () => {
    if (smAndDown.value) isOpen.value = false
  },
)
async function closeMenu() {
  if (!smAndDown.value) return
  isOpen.value = false
  await nextTick()
  menuButton.value?.focus()
}
async function logout() {
  if (signingOut.value) return
  signingOut.value = true
  logoutError.value = ''
  try {
    await auth.clearAuth()
    await navigateTo('/')
  } catch {
    logoutError.value = 'No pudimos cerrar la sesión. Vuelve a intentarlo.'
  } finally {
    signingOut.value = false
  }
}
</script>

<template>
  <v-app-bar
    v-if="smAndDown"
    color="#04474a"
    :elevation="0"
    class="admin-mobile-bar"
  >
    <button
      ref="menuButton"
      type="button"
      class="admin-menu-button"
      aria-label="Abrir navegación de administración"
      aria-controls="admin-navigation"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <svg
        aria-hidden="true"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
      >
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <span class="admin-mobile-bar__title">Administración KAIROS</span>
  </v-app-bar>
  <v-navigation-drawer
    v-model="isOpen"
    :width="272"
    :mobile="smAndDown"
    :temporary="smAndDown"
    :permanent="!smAndDown"
    disable-resize-watcher
    class="admin-navigation"
    @keydown.esc="closeMenu"
  >
    <div class="admin-navigation__inner">
      <header class="admin-navigation__header">
        <NuxtLink
          to="/admin/recommendations"
          class="admin-navigation__brand"
          aria-label="Kairos, administración general"
          @click="closeMenu"
        >
          <img src="/logo-white.png" alt="" width="40" height="40" />
          <span
            ><strong>Kairos</strong><small>Administración general</small></span
          >
        </NuxtLink>
        <button
          v-if="smAndDown"
          type="button"
          class="admin-menu-button admin-navigation__close"
          aria-label="Cerrar navegación de administración"
          @click="closeMenu"
        >
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
          >
            <path d="m6 6 12 12M6 18 18 6" />
          </svg>
        </button>
      </header>
      <nav
        id="admin-navigation"
        aria-label="Administración general"
        class="admin-navigation__links"
      >
        <NuxtLink
          to="/admin/recommendations"
          class="admin-navigation__link"
          :class="{ 'admin-navigation__link--active': active }"
          :aria-current="active ? 'page' : undefined"
          @click="closeMenu"
        >
          <svg
            aria-hidden="true"
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
              d="M8 3h8v4H8zM8 5H6a2 2 0 0 0-2 2v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7a2 2 0 0 0-2-2h-2M8 12h8M8 16h5"
            />
          </svg>
          Recomendaciones
        </NuxtLink>
      </nav>
      <footer class="admin-navigation__footer">
        <nav aria-label="Cambiar de vista" class="admin-navigation__links">
          <NuxtLink
            to="/institute/dashboard"
            class="admin-navigation__link"
            @click="closeMenu"
          >
            Vista de instituto
          </NuxtLink>
          <NuxtLink
            to="/user/dashboard"
            class="admin-navigation__link"
            @click="closeMenu"
          >
            Vista de alumno
          </NuxtLink>
        </nav>
        <p v-if="logoutError" role="alert">{{ logoutError }}</p>
        <button
          type="button"
          class="admin-navigation__logout"
          :disabled="signingOut"
          @click="logout"
        >
          <svg
            aria-hidden="true"
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
              d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l-5-5 5-5M5 12h11"
            />
          </svg>
          {{ signingOut ? 'Cerrando sesión…' : 'Cerrar sesión' }}
        </button>
      </footer>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.admin-navigation {
  background: #04474a !important;
  color: #fff !important;
  border-top-right-radius: 32px;
  font-family: 'Figtree', sans-serif;
}
.admin-navigation__inner {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 24px 16px;
  gap: 32px;
}
.admin-navigation__header,
.admin-navigation__brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.admin-navigation__brand {
  min-height: 48px;
  text-decoration: none;
  color: inherit;
  flex: 1;
  min-width: 0;
}
.admin-navigation__brand img {
  flex: 0 0 40px;
  object-fit: contain;
}
.admin-navigation__brand strong {
  display: block;
  font-size: 19px;
  font-weight: 800;
}
.admin-navigation__brand small {
  display: block;
  color: #dbf2f4;
  font-size: 12px;
  line-height: 1.5;
}
.admin-navigation__links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.admin-navigation__link,
.admin-navigation__logout {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 46px;
  padding: 12px 14px;
  border-radius: 999px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
}
.admin-navigation__link svg,
.admin-navigation__logout svg {
  flex-shrink: 0;
}
.admin-navigation__link:hover,
.admin-navigation__logout:hover:not(:disabled),
.admin-menu-button:hover {
  background: rgb(255 255 255 / 8%);
}
.admin-navigation__link--active {
  background: #fff;
  color: #04474a;
  font-weight: 700;
}
.admin-navigation__link--active:hover {
  background: #dbf2f4;
}
.admin-navigation__footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgb(255 255 255 / 20%);
}
.admin-navigation__footer p {
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.5;
}
.admin-navigation__logout {
  width: 100%;
  text-align: left;
}
.admin-navigation__logout:disabled {
  opacity: 0.65;
  cursor: wait;
}
.admin-menu-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-width: 44px;
  min-height: 44px;
  border-radius: 50%;
  color: #fff;
  margin: 0 8px;
}
.admin-navigation__close {
  margin: 0;
  flex: 0 0 44px;
}
.admin-mobile-bar {
  font-family: 'Figtree', sans-serif;
}
.admin-mobile-bar__title {
  font-size: 15px;
  font-weight: 700;
  padding-right: 16px;
}
.admin-navigation :is(a, button):focus-visible,
.admin-menu-button:focus-visible {
  outline: 3px solid #6cc5cb;
  outline-offset: 3px;
}
.admin-navigation__link--active:focus-visible {
  outline-color: #fff;
}
</style>
