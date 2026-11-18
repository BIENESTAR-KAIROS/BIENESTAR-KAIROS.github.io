<script setup lang="ts">
import QuestionnaireCart from '~/components/institute/my-quizzes/questionnaire-cart.vue'
import { useAppStore } from '~/store/app'
import { useDisplay } from 'vuetify'

const appStore = useAppStore()
const { smAndDown } = useDisplay()

function openNavBar() {
  appStore.isNavBarOpen = true
}
</script>

<template>
  <v-app-bar
    v-if="smAndDown"
    :elevation="0"
    color="#3c2f52"
    class="institute-app-bar"
  >
    <v-btn
      aria-label="Abrir navegación institucional"
      icon="mdi-menu"
      color="white"
      class="text-h6"
      @click="openNavBar"
    />

    <template #append>
      <div class="mobile-brand-actions">
        <QuestionnaireCart />
        <NuxtLink href="/institute/dashboard" aria-label="Inicio de Kairos">
          <v-img
            src="/logo-white.png"
            height="40"
            width="40"
            class="nav-logo"
          />
        </NuxtLink>
      </div>
    </template>
  </v-app-bar>
  <QuestionnaireCart v-else floating />
</template>

<style scoped>
.mobile-brand-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-inline-end: max(16px, env(safe-area-inset-right));
}
.mobile-brand-actions a {
  display: grid;
  place-items: center;
  min-width: 44px;
  min-height: 44px;
  flex-shrink: 0;
}
.institute-app-bar {
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
}
</style>
