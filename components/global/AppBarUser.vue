<script setup lang="ts">
import navigationList from '~/utils/constants/navigation-list'
import { useAppStore } from '~/store/app'
import { useDisplay } from 'vuetify'
import { NuxtLink } from '#components'
import { useAuthStore } from '~/store/auth'

const { $router } = useNuxtApp()
const appStore = useAppStore()
const authStore = useAuthStore()
const { mobile } = useDisplay()

const updateNavBarState = (value: boolean) => {
  appStore.isNavBarOpen = value
}

const isOpen = computed(() => {
  return appStore.isNavBarOpen
})

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
})
</script>

<template>
  <v-navigation-drawer
    :width="275"
    class="bg-greenShadow rounded-te-xxxl"
    :model-value="isOpen"
    @update:model-value="updateNavBarState"
  >
    <v-list-item>
      <NuxtLink href="/user/dashboard">
        <v-sheet class="d-flex justify-space-around bg-transparent mt-5 px-6">
          <v-img src="/logo-white.png" class="logo-img" />
        </v-sheet>
      </NuxtLink>
    </v-list-item>

    <v-list-item
      v-for="(navOption, i) in navigationList"
      :key="i"
      link
      :to="'/user' + navOption.to"
      class="my-5"
      variant="text"
    >
      <v-list-item-title class="catamaran-text text-h6">
        {{ navOption.title }}
      </v-list-item-title>
    </v-list-item>
    <v-list-item class="my-5" variant="text" @click="logout">
      <v-list-item-title class="catamaran-text text-h6">
        Cerrar sesión
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
