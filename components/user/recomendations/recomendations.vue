<script setup lang="ts">
import { computed, ref } from 'vue'
import BooksRecomendations from './books-recomendations.vue'
import CustomRecomendations from './custom-recomendations.vue'
import News from './news.vue'

type RecomendationTab = 'personalizadas' | 'libros' | 'noticias'

const tab = ref<RecomendationTab>('personalizadas')

const tabs: { value: RecomendationTab; label: string }[] = [
  { value: 'personalizadas', label: 'Personalizadas' },
  { value: 'libros', label: 'Libros' },
  { value: 'noticias', label: 'Noticias' },
]

const subtitleByTab: Record<RecomendationTab, string> = {
  personalizadas:
    'Con base en tus resultados y tu perfil. Se renuevan cada mañana.',
  libros: 'Lecturas revisadas por los especialistas de tu universidad.',
  noticias:
    'Noticias de salud mental y bienestar, seleccionadas por tu universidad.',
}

const tabComponent = computed(() => {
  if (tab.value === 'libros') return BooksRecomendations
  if (tab.value === 'noticias') return News
  return CustomRecomendations
})
</script>

<template>
  <div class="recomendations">
    <header class="recomendations__header">
      <div class="recomendations__copy">
        <span class="recomendations__title">Tus recomendaciones</span>
        <span class="recomendations__subtitle">{{ subtitleByTab[tab] }}</span>
      </div>
      <div class="recomendations__pills">
        <button
          v-for="item in tabs"
          :key="item.value"
          type="button"
          class="recomendations__pill"
          :class="{ 'recomendations__pill--active': tab === item.value }"
          @click="tab = item.value"
        >
          {{ item.label }}
        </button>
      </div>
    </header>

    <component :is="tabComponent" />
  </div>
</template>

<style scoped>
.recomendations {
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
  background: #f4f8f9;
  min-height: 100vh;
  padding: 24px 36px 48px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.recomendations__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.recomendations__copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.recomendations__title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.recomendations__subtitle {
  font-size: 15px;
  color: #4b5f68;
}

.recomendations__pills {
  display: flex;
  gap: 8px;
  background: #fff;
  border-radius: 999px;
  padding: 5px;
  border: 1px solid #eaf1f2;
  flex: 0 0 auto;
}

.recomendations__pill {
  height: 36px;
  padding: 0 18px;
  border-radius: 999px;
  border: 0;
  background: transparent;
  color: #5c7078;
  font-family: 'Figtree', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.recomendations__pill:hover:not(.recomendations__pill--active) {
  color: #065c5d;
}

.recomendations__pill--active {
  background: #065c5d;
  color: #fff;
  font-weight: 700;
}

@media (max-width: 720px) {
  .recomendations {
    padding: 20px 18px 40px;
  }

  .recomendations__header {
    align-items: flex-start;
  }

  .recomendations__pills {
    width: 100%;
  }

  .recomendations__pill {
    flex: 1;
  }
}
</style>
