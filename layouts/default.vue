<script setup lang="ts">
import AppBarUser from "~/components/global/AppBarUser.vue";
import NavBarUser from "~/components/global/NavBarUser.vue";
</script>
<template>
  <v-app>
    <v-main>
      <AppBarUser />
      <NavBarUser/>
      <NuxtPage />
    </v-main>
  </v-app>
</template>
