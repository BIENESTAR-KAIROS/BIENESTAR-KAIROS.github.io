<script setup lang="ts">
const props = defineProps<{
  title?: string | null
  assignedAt?: string | null
}>()

const formatter = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'long',
  timeStyle: 'short',
})
const date = computed(() => {
  if (!props.assignedAt) return null
  const value = new Date(props.assignedAt)
  return Number.isFinite(value.getTime()) ? value : null
})
</script>

<template>
  <div class="recommendation-source">
    <p>
      {{ title ? `Cuestionario · ${title}` : 'Cuestionario sin registrar' }}
    </p>
    <p class="recommendation-source__date">
      <template v-if="date">
        Fecha de asignación ·
        <time :datetime="date.toISOString()">{{ formatter.format(date) }}</time>
      </template>
      <template v-else>Fecha de asignación sin registrar</template>
    </p>
  </div>
</template>

<style scoped>
.recommendation-source {
  overflow-wrap: anywhere;
  color: #065c5d;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}
.recommendation-source p {
  margin: 0;
}
.recommendation-source__date {
  color: #4b5f68;
  font-size: 13px;
  font-weight: 500;
}
</style>
