<script setup lang="ts">
import AppBar from "~/components/global/AppBarInstitute.vue";
import NavBarInstitue from "~/components/global/NavBarInstitue.vue";
</script>

<template>
  <v-app class="institute-app">
    <v-main class="institute-main">
      <AppBar />
      <NavBarInstitue />
      <NuxtPage />
    </v-main>
  </v-app>
</template>

<style scoped>
.institute-app,
.institute-main {
  background: #f5f4f8;
}
</style>
