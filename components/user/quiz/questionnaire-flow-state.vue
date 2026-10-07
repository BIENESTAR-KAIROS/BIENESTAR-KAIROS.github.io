<script setup lang="ts">
defineProps<{
  loading?: boolean
  error?: boolean
  title?: string
  message: string
}>()
defineEmits<{ retry: [] }>()
</script>
<template>
  <section class="flow-state" :aria-busy="loading">
    <div class="flow-state__panel">
      <h1 v-if="title">{{ title }}</h1>
      <p :role="error ? 'alert' : 'status'">{{ message }}</p>
      <div v-if="!loading" class="flow-state__actions">
        <button v-if="error" type="button" @click="$emit('retry')">
          Reintentar
        </button>
        <NuxtLink to="/user/dashboard">Volver al inicio</NuxtLink>
      </div>
    </div>
  </section>
</template>
<style scoped>
.flow-state {
  min-height: 100vh;
  padding: 48px 24px;
  background: #f4f8f9;
  color: #0e2a36;
  font-family: 'Figtree', sans-serif;
}
.flow-state__panel {
  max-width: 720px;
  margin: 0 auto;
  padding: 28px;
  border: 1px solid #eaf1f2;
  border-radius: 24px;
  background: #fff;
}
h1 {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 800;
}
p {
  margin: 0;
  line-height: 1.6;
  color: #4b5f68;
}
p[role='alert'] {
  color: #8a1c1c;
}
.flow-state__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}
button,
a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 10px 24px;
  border: 2px solid #065c5d;
  border-radius: 999px;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}
button {
  background: #065c5d;
  color: #fff;
}
a {
  background: #fff;
  color: #065c5d;
}
button:focus-visible,
a:focus-visible {
  outline: 3px solid #07979f;
  outline-offset: 4px;
}
@media (max-width: 700px) {
  .flow-state {
    padding: 24px 16px;
  }
  .flow-state__panel {
    padding: 22px 18px;
  }
  h1 {
    font-size: 22px;
  }
}
</style>
