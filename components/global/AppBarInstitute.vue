<script setup lang="ts">
import navListInstitute from '~/utils/constants/navigation-list-institute'
import { useAppStore } from '~/store/app'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '~/store/auth'
import { UserRolEnum } from '~/interfaces/user/enum/user-rol.enum'

const { $router } = useNuxtApp()
const appStore = useAppStore()
const authStore = useAuthStore()
const { mobile } = useDisplay()

function openNavBar() {
  appStore.isNavBarOpen = true
}

let roles = authStore.user?.roles || []

async function logout() {
  try {
    authStore.clearAuth()
    $router.push('/')
  } catch (error) {
    console.log(error)
  }
}
onMounted(() => {
  roles = authStore.user?.roles || []
})
</script>

<template>
  <v-app-bar :elevation="5" color="thirdy">
    <template v-slot:prepend>
      <NuxtLink href="/institute/dashboard" class="h-100">
        <v-img
          src="/logo-white.png"
          height="100"
          width="100"
          class="nav-logo"
        />
      </NuxtLink>
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
        <v-list-item
          v-if="
            roles.find(
              (rol: UserRolEnum) =>
                rol === UserRolEnum.INSTITUTION_ADMIN ||
                rol === UserRolEnum.INSTITUTION_STAFF ||
                rol === UserRolEnum.KAIROS_ADMIN,
            )
          "
          class="my-5"
          variant="text"
          link
          :to="'/institute/dashboard'"
        >
          <v-list-item-title class="catamaran-text text-h5">
            Vista de instituto
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="
            roles.find((rol: UserRolEnum) => rol === UserRolEnum.KAIROS_ADMIN)
          "
          class="my-5"
          variant="text"
          link
          :to="'/admin/dashboard'"
        >
          <v-list-item-title class="catamaran-text text-h5">
            Vista de administrador
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="roles.find((rol: UserRolEnum) => rol === UserRolEnum.STUDENT)"
          class="my-5"
          variant="text"
          link
          :to="'/user/dashboard'"
        >
          <v-list-item-title class="catamaran-text text-h5">
            Vista de alumno
          </v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-title class="catamaran-text text-h5">
            Cerrar sesión
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </template>
    <template v-slot:append>
      <v-btn
        v-if="mobile"
        icon="mdi-menu"
        @click="openNavBar"
        color="white"
        class="text-h6"
      />
    </template>
  </v-app-bar>
</template>

<style scoped>
.nav-logo {
  margin: 0 1.5rem;
}
</style>
