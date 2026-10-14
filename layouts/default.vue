<script setup lang="ts">
import StudentPreviewBanner from '~/components/admin/institutions/StudentPreviewBanner.vue'
import { useAuthStore } from '~/store/auth'
import AppBarUser from '~/components/global/AppBarUser.vue'
import NavBarUser from '~/components/global/NavBarUser.vue'
const auth = useAuthStore()
</script>
<template>
  <v-app>
    <v-main>
      <AppBarUser />
      <NavBarUser />
      <StudentPreviewBanner />
      <NuxtPage
        :key="`${auth.institutionContextMode}:${auth.activeInstitute?._id ?? 'self'}`"
      />
    </v-main>
  </v-app>
</template>
