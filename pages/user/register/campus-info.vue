<script setup lang="ts">
import InstitutionAffiliation from '~/components/user/profile/institution-affiliation.vue'
definePageMeta({ layout: 'empty-login' })
</script>
<template>
  <main class="setup"><InstitutionAffiliation onboarding /></main>
</template>
<style scoped>
.setup {
  max-width: 620px;
  margin: clamp(20px, 8vh, 80px) auto;
  padding: 0 16px;
}
</style>
