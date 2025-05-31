<script setup lang="ts">
import AppBar from "~/components/global/AppBarInstitute.vue";
import NavBarInstitue from "~/components/global/NavBarInstitue.vue";
</script>

<template>
  <v-app>
    <v-main>
      <AppBar />
      <NavBarInstitue />
      <NuxtPage />
    </v-main>
  </v-app>
</template>
