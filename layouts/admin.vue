<script setup lang="ts">
import AdminNavigation from '~/components/admin/AdminNavigation.vue'
</script>

<template>
  <v-app class="admin-app">
    <AdminNavigation />
    <v-main class="admin-main"><slot /></v-main>
  </v-app>
</template>

<style scoped>
.admin-app,
.admin-main {
  background: #f4f8f9;
  color: #0e2a36;
  font-family: 'Figtree', sans-serif;
}
.admin-main {
  min-width: 0;
}
</style>
