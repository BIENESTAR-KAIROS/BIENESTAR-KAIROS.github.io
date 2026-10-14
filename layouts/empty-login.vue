<script setup lang="ts">
import StudentPreviewBanner from '~/components/admin/institutions/StudentPreviewBanner.vue'
import { useAuthStore } from '~/store/auth'
const auth = useAuthStore()
</script>
<template>
  <v-app class="login-bg">
    <v-main>
      <StudentPreviewBanner />
      <NuxtPage
        :key="`${auth.institutionContextMode}:${auth.activeInstitute?._id ?? 'self'}`"
      />
    </v-main>
  </v-app>
</template>

<style scoped lang="css">
.login-bg {
  margin: 0;
  background-image: url('~/assets/images/background-login.png');
  background-position: center;
  background-size: cover;
}
</style>
