<script setup lang="ts">
const navList = [
  {
    title: "Inicio",
    to: "/dashboard",
  },
  {
    title: "Mis usuarios",
    to: "/my-users",
  },
  {
    title: "Mis estadísticas",
    to: "/stats",
  },
  {
    title: "Mis cuestionarios",
    to: "/quizzes",
  },
  {
    title: "Cerrar sesión",
    to: "/login",
  },
];
</script>

<template>
  <v-app-bar :elevation="2" color="secondary">
    <template v-slot:prepend>
      <v-img src="/logo-white.png" height="100" width="100" class="nav-logo" />
    </template>

    <template v-if="$vuetify.display.mdAndUp" v-slot:append>
      <v-list class="bg-secondary d-flex">
        <v-list-item
          v-for="(navOption, i) in navList"
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
  </v-app-bar>
</template>

<style scoped>
.nav-logo {
  margin: 0 1.5rem;
}
</style>
