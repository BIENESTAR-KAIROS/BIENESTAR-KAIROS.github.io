<script setup lang="ts">
import AuthShell from '../global/AuthShell.vue'
import LoginForm from './LoginForm.vue'
</script>

<template>
  <AuthShell
    title="Tu bienestar es la razón de todo esto."
    description="Kairos acompaña a alumnos y a los equipos de bienestar de su institución con datos que respetan la privacidad de cada persona."
  >
    <LoginForm />
  </AuthShell>
</template>
