<script setup lang="ts">
import { inject } from 'vue'
import { specialists } from './specialists-data'

const practices = [
  {
    category: 'Gratitud',
    title: 'Diario de gratitud',
    description:
      'Un espacio donde registras regularmente lo que agradeces para entrenar tu mente a enfocarse en lo positivo, mejorar tu bienestar emocional y transformar tu perspectiva de vida.',
    link: 'https://www.elpradopsicologos.es/blog/diario-gratitud/',
  },
]

const featuredSpecialist = specialists[0]
const goToHelpTab = inject<(value: string) => void>('goToHelpTab')
</script>

<template>
  <div class="practices">
    <div class="practices__intro">
      <span class="practices__title">Prácticas del bienestar</span>
      <span class="practices__subtitle">
        Con base en la información que nos has proporcionado en tus
        cuestionarios, tenemos algunas recomendaciones de prácticas aprobadas
        por nuestros especialistas que te ayudarán a mejorar tu bienestar.
      </span>
    </div>

    <div class="practices__grid">
      <div v-for="(practice, i) in practices" :key="i" class="practice-card">
        <span class="practice-card__badge">{{ practice.category }}</span>
        <span class="practice-card__title">{{ practice.title }}</span>
        <span class="practice-card__description">
          {{ practice.description }}
        </span>
        <a
          :href="practice.link"
          target="_blank"
          rel="noopener"
          class="practice-card__link"
        >
          Saber más
        </a>
      </div>

      <button
        v-if="featuredSpecialist"
        type="button"
        class="practice-card practice-card--promo"
        @click="goToHelpTab?.('specialists')"
      >
        <img :src="featuredSpecialist.image" alt="" class="practice-card--promo__icon" />
        <span class="practice-card--promo__title">
          {{ featuredSpecialist.title }}
        </span>
        <span class="practice-card--promo__description">
          {{ featuredSpecialist.specialities.slice(0, 3).join(', ') }}
        </span>
        <span class="practice-card--promo__cta">Conoce especialistas →</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.practices {
  padding: 30px 36px 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.practices__intro {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.practices__title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.practices__subtitle {
  font-size: 15px;
  color: #4b5f68;
  max-width: 720px;
  line-height: 1.6;
}

.practices__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.practice-card {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 260px;
}

.practice-card__badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  background: #dbf2f4;
  color: #065c5d;
  font-size: 11px;
  font-weight: 700;
}

.practice-card__title {
  font-size: 20px;
  font-weight: 800;
}

.practice-card__description {
  font-size: 14px;
  color: #5c7078;
  line-height: 1.6;
  flex: 1;
}

.practice-card__link {
  align-self: flex-start;
  height: 44px;
  padding: 0 20px;
  border-radius: 999px;
  border: 0;
  background: #dbf2f4;
  color: #065c5d;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.practice-card__link:hover {
  background: #6cc5cb;
  color: #fff;
}

.practice-card--promo {
  background: #065c5d;
  color: #fff;
  border: 0;
  cursor: pointer;
  text-align: left;
  font-family: 'Figtree', sans-serif;
}

.practice-card--promo__icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.practice-card--promo__title {
  font-size: 19px;
  font-weight: 800;
  line-height: 1.25;
}

.practice-card--promo__description {
  font-size: 14px;
  color: #c7e9ea;
  line-height: 1.6;
  flex: 1;
}

.practice-card--promo__cta {
  align-self: flex-start;
  font-size: 14px;
  font-weight: 700;
  color: #6cc5cb;
}

@media (max-width: 1180px) {
  .practices__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 720px) {
  .practices {
    padding: 20px 18px 40px;
  }

  .practices__grid {
    grid-template-columns: 1fr;
  }
}
</style>
