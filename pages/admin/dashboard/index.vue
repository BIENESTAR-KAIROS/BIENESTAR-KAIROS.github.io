<script setup lang="ts">
definePageMeta({ layout: 'institute' })
</script>
<template>
  <main class="pa-8">
    <h1>Administración de KAIROS</h1>
    <p class="my-4">
      Gestiona las recomendaciones de KAIROS y de las instituciones.
    </p>
    <v-btn to="/admin/recommendations" color="#3c2f52"
      >Administrar recomendaciones</v-btn
    >
  </main>
</template>
