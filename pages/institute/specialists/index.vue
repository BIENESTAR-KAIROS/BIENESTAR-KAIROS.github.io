<script setup lang="ts">
import SpecialistManager from '~/components/global/specialists/SpecialistManager.vue'
import { useAuthStore } from '~/store/auth'
definePageMeta({ layout: 'institute' })
const auth = useAuthStore()
</script>

<template><SpecialistManager :key="auth.activeInstitute?._id" /></template>
