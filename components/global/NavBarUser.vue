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
    :elevation="4"
    color="greenShadow"
    class=" "
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
        <v-img src="/logo-white.png" height="60" width="60" class="nav-logo" />
      </NuxtLink>
    </template>
  </v-app-bar>
</template>
