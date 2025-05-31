<script setup lang="ts">
import navListInstitute from '~/utils/constants/navigation-list-institute'
import { useAppStore } from "~/store/app"
import { useDisplay } from "vuetify"

const appStore = useAppStore();
const { mobile } = useDisplay();

const updateNavBarState = (value: boolean) => {
  appStore.isNavBarOpen = value;
}

const isOpen = computed(() => {
  return appStore.isNavBarOpen;
})

watch(mobile, () => {
    appStore.isNavBarOpen = false; 
})

</script>
<template>
  <v-navigation-drawer
    :width="275"
    class="bg-thirdy rounded-ts-xxxl"
    :model-value="isOpen"
    @update:model-value="updateNavBarState"
    location="right"
    mobile
  >
    <a href="/user/dashboard">
      <v-sheet class="d-flex justify-space-around bg-transparent mt-5 px-6">
        <v-img src="/logo-white.png" class="logo-img" />
      </v-sheet>
    </a>

    <v-list-item
      v-for="(navOption, i) in navListInstitute"
      :key="i"
      link
        :to="'/institute' + navOption.to"
      class="my-5"
      variant="text"
    >
      <v-list-item-title class="catamaran-text text-h6">
        {{ navOption.title }}
      </v-list-item-title>
    </v-list-item>
  </v-navigation-drawer>
</template>

<style scoped>
.logo-img {
  width: 250px !important;
}

.v-list-item-subtitle,
.v-list-item-title {
  text-overflow: initial !important;
  white-space: initial !important;
}
</style>
