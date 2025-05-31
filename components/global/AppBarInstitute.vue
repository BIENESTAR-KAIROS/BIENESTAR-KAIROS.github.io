<script setup lang="ts">
import navListInstitute from '~/utils/constants/navigation-list-institute'
import { useAppStore } from "~/store/app"
import { useDisplay } from "vuetify"

const appStore = useAppStore();
const { mobile } = useDisplay();

function openNavBar() {
  appStore.isNavBarOpen = true;
}
</script>

<template>
  <v-app-bar :elevation="5" color="thirdy">
    <template v-slot:prepend>
      <v-img src="/logo-white.png" height="100" width="100" class="nav-logo" />
    </template>

    <template v-if="$vuetify.display.mdAndUp" v-slot:append>
      <v-list class="bg-thirdy d-flex">
        <v-list-item
          v-for="(navOption, i) in navListInstitute"
          :key="i"
          link
          :to="'/institute' + navOption.to"
        >
          <v-list-item-title class="catamaran-text text-h5">
            {{ navOption.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </template>
    <template v-slot:append>
    <v-btn v-if="mobile" icon="mdi-menu"  @click="openNavBar" color="white" class="text-h6" />
    </template>
  </v-app-bar>
</template>

<style scoped>
.nav-logo {
  margin: 0 1.5rem;
}
</style>
