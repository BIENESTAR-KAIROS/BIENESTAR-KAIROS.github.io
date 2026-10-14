<script setup lang="ts">
import AppBar from '~/components/global/AppBarInstitute.vue'
import NavBarInstitue from '~/components/global/NavBarInstitue.vue'
import { useAuthStore } from '~/store/auth'
const auth = useAuthStore()
</script>

<template>
  <v-app class="institute-app">
    <v-main class="institute-main">
      <AppBar />
      <NavBarInstitue />
      <aside
        v-if="auth.isInstitutionContext"
        class="institution-context"
        aria-label="Administración de institución"
      >
        <p>
          Administrando <strong>{{ auth.activeInstitute?.name }}</strong
          ><span>Permisos de administrador institucional</span>
        </p>
        <NuxtLink to="/admin/institutions">Volver al admin general</NuxtLink>
      </aside>
      <NuxtPage :key="auth.activeInstitute?._id" />
    </v-main>
  </v-app>
</template>

<style scoped>
.institution-context {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin: 20px 32px 0;
  padding: 16px 20px;
  background: #f0eaf5;
  border: 1px solid #ddd5e7;
  border-radius: 16px;
  color: #3c2f52;
  font-family: 'Figtree', sans-serif;
  overflow-wrap: anywhere;
}
.institution-context span {
  display: block;
  font-size: 13px;
  margin-top: 4px;
}
.institution-context a {
  color: #3c2f52;
  font-weight: 700;
  padding: 12px;
  border-radius: 999px;
}
.institution-context a:focus-visible {
  outline: 3px solid #655080;
  outline-offset: 3px;
}
@media (max-width: 720px) {
  .institution-context {
    margin: 16px 18px 0;
  }
}
.institute-app,
.institute-main {
  background: #f5f4f8;
}
</style>
