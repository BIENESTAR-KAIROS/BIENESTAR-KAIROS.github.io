<script setup lang="ts">
import DashboardInstitute from '~/components/institute/dashboard/dashboard-institute.vue';

definePageMeta({
  layout: "institute",
});
</script>

<template>
  <main class="institute-page">
    <DashboardInstitute />
  </main>
</template>

<style scoped>
.institute-page {
  min-height: 100vh;
  background: #f5f4f8;
}
</style>
