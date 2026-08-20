<script setup lang="ts">
import { useAppStore } from '~/store/app'
import { useDisplay } from 'vuetify'

const appStore = useAppStore()
const { mobile } = useDisplay()

function openNavBar() {
  appStore.isNavBarOpen = true
}
</script>

<template>
  <v-app-bar
    v-if="$vuetify.display.smAndDown"
    :elevation="0"
    color="#065C5D"
    class="kairos-app-bar"
  >
    <v-btn
      v-if="mobile"
      icon="mdi-menu"
      @click="openNavBar"
      color="white"
      class="text-h6"
    />

    <template v-if="$vuetify.display.smAndDown" #append>
      <NuxtLink href="/user/dashboard">
        <v-img src="/logo-white.png" height="40" width="40" class="nav-logo" />
      </NuxtLink>
    </template>
  </v-app-bar>
</template>

<style scoped>
.kairos-app-bar {
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
}
</style>
