<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
const auth = useAuthStore()
</script>

<template>
  <section
    v-if="auth.isStudentPreview"
    class="student-preview"
    aria-label="Vista de alumno en exploración"
  >
    <div>
      <strong>Vista de alumno · {{ auth.activeInstitute?.name }}</strong>
      <p>
        Solo exploración. No se guardan respuestas ni cambios. Puedes abrir cada
        cuestionario sin completar los anteriores.
      </p>
    </div>
    <nav aria-label="Cambiar vista de alumno">
      <NuxtLink to="/admin/institutions?view=student"
        >Cambiar institución</NuxtLink
      >
      <NuxtLink to="/admin/institutions">Volver al admin general</NuxtLink>
    </nav>
  </section>
</template>

<style scoped>
.student-preview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 36px;
  background: #dbf2f4;
  color: #0e2a36;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
}
.student-preview > div {
  flex: 1 1 320px;
  min-width: 0;
  overflow-wrap: anywhere;
}
strong {
  font-size: 16px;
}
p {
  margin: 6px 0 0;
  line-height: 1.6;
}
nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 8px 16px;
  border: 2px solid #065c5d;
  border-radius: 999px;
  color: #065c5d;
  font-weight: 700;
  text-decoration: none;
}
a:hover {
  background: #fff;
}
a:focus-visible {
  outline: 3px solid #065c5d;
  outline-offset: 3px;
}
@media (max-width: 720px) {
  .student-preview {
    padding: 18px;
  }
}
</style>
