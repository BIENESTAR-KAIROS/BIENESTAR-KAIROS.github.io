<script setup lang="ts">
import MyUsersDashboard from '~/components/institute/my-users/my-users-dashboard.vue';

definePageMeta({
  layout: "institute",
});
</script>

<template>
  <main>
    <h1>Mis usuarios</h1>
    <MyUsersDashboard />
  </main>
</template>
