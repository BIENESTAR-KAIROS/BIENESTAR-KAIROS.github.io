<script setup lang="ts">
import type { ITrackingTask } from '~/interfaces/tracking/tracking-task.interface'

defineProps<{
  tasks: ITrackingTask[]
  togglingIds: string[]
}>()

const emit = defineEmits<{
  (e: 'toggle', recommendationId: string): void
}>()
</script>

<template>
  <div class="today-tasks">
    <div v-if="tasks.length === 0" class="today-tasks__empty">
      Todavía no tienes recomendaciones asignadas para hoy.
    </div>
    <div
      v-for="task in tasks"
      :key="task.recommendationId"
      class="today-tasks__row"
    >
      <button
        type="button"
        class="today-tasks__check"
        :class="{ 'today-tasks__check--done': task.isCompleted }"
        :disabled="togglingIds.includes(task.recommendationId)"
        @click="emit('toggle', task.recommendationId)"
      >
        <svg
          v-if="task.isCompleted"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          stroke-width="3.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 13l4 4 10-10" />
        </svg>
      </button>
      <div class="today-tasks__copy">
        <span
          class="today-tasks__label"
          :class="{ 'today-tasks__label--done': task.isCompleted }"
        >
          {{ task.recommendation }}
        </span>
        <span class="today-tasks__category">Basado en: {{ task.category }}</span>
      </div>
      <span v-if="task.isCompleted" class="today-tasks__status">Hecho</span>
      <button
        v-else
        type="button"
        class="today-tasks__mark"
        :disabled="togglingIds.includes(task.recommendationId)"
        @click="emit('toggle', task.recommendationId)"
      >
        Marcar
      </button>
    </div>
  </div>
</template>

<style scoped>
.today-tasks {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  overflow: hidden;
}

.today-tasks__empty {
  padding: 22px;
  font-size: 14px;
  color: #5f767e;
}

.today-tasks__row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid #f0f5f6;
}

.today-tasks__row:last-child {
  border-bottom: 0;
}

.today-tasks__check {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  border-radius: 999px;
  border: 2px solid #cfdde1;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.today-tasks__check--done {
  border: 0;
  background: #065c5d;
}

.today-tasks__copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.today-tasks__label {
  font-size: 15px;
  font-weight: 600;
}

.today-tasks__label--done {
  color: #5f767e;
  text-decoration: line-through;
}

.today-tasks__category {
  font-size: 12px;
  color: #5f767e;
}

.today-tasks__status {
  font-size: 12px;
  font-weight: 700;
  color: #065c5d;
  flex: 0 0 auto;
}

.today-tasks__mark {
  height: 36px;
  padding: 0 18px;
  border-radius: 999px;
  border: 0;
  background: #dbf2f4;
  color: #065c5d;
  font-family: 'Figtree', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  flex: 0 0 auto;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.today-tasks__mark:hover:not(:disabled) {
  background: #6cc5cb;
  color: #fff;
}

.today-tasks__mark:disabled,
.today-tasks__check:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
