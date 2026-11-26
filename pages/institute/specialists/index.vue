<script setup lang="ts">
import SpecialistManager from '~/components/global/specialists/SpecialistManager.vue'
import { useAuthStore } from '~/store/auth'
definePageMeta({ layout: 'institute' })
const auth = useAuthStore()
const instituteId = computed(() =>
  typeof auth.activeInstitute === 'string'
    ? auth.activeInstitute
    : auth.activeInstitute?._id,
)
</script>

<template><SpecialistManager :key="instituteId" /></template>
