<script setup lang="ts">
import { computed } from 'vue'
import { specialists } from './specialists-data'
import { useAuthStore } from '~/store/auth'

const authStore = useAuthStore()
const institute = computed(() => authStore.user?.institute)

function isEmail(value: string): boolean {
  return value.includes('@')
}

function contactHref(value: string): string {
  return isEmail(value) ? `mailto:${value}` : `tel:${value.replace(/\s+/g, '')}`
}
</script>

<template>
  <div class="specialists">
    <div class="specialists__intro">
      <span class="specialists__title">Conoce especialistas</span>
      <span class="specialists__subtitle">
        Servicios de tu universidad y aliados cercanos. Todas las citas son
        confidenciales.
      </span>
    </div>

    <div v-if="institute?.phoneNumber" class="urgency">
      <span class="urgency__icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v5" /><path d="M12 16.5h.01" /><path d="M10.3 3.9 2.6 17a1.6 1.6 0 0 0 1.4 2.4h16a1.6 1.6 0 0 0 1.4-2.4L13.7 3.9a1.6 1.6 0 0 0-2.8 0z" /></svg>
      </span>
      <div class="urgency__copy">
        <span class="urgency__title">¿Necesitas hablar con alguien ahora?</span>
        <span class="urgency__description">
          Contacta directamente a {{ institute.name || 'tu institución' }}.
        </span>
      </div>
      <a :href="`tel:${institute.phoneNumber}`" class="urgency__btn">
        Llamar ahora
      </a>
    </div>

    <div v-if="specialists.length === 0" class="specialists__empty">
      Todavía no hay especialistas disponibles para mostrar.
    </div>

    <div v-else class="specialists__grid">
      <div v-for="(specialist, i) in specialists" :key="i" class="specialist-card">
        <div class="specialist-card__header">
          <span class="specialist-card__avatar">
            <img :src="specialist.image" alt="" />
          </span>
          <div class="specialist-card__heading">
            <span class="specialist-card__name">{{ specialist.title }}</span>
            <span class="specialist-card__badge">Servicio de tu universidad</span>
          </div>
        </div>

        <div class="specialist-card__section">
          <span class="specialist-card__label">Especialidades</span>
          <div class="specialist-card__chips">
            <span
              v-for="(speciality, j) in specialist.specialities"
              :key="j"
              class="specialist-card__chip"
            >
              {{ speciality }}
            </span>
          </div>
        </div>

        <div class="specialist-card__section">
          <span class="specialist-card__label">Ubicación</span>
          <div
            v-for="(place, j) in specialist.schedule"
            :key="j"
            class="specialist-card__row"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#07979F" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" /><circle cx="12" cy="10" r="2.4" /></svg>
            <span>{{ place }}</span>
          </div>
        </div>

        <div class="specialist-card__section">
          <span class="specialist-card__label">Contacto</span>
          <a
            v-for="(contact, j) in specialist.contact"
            :key="j"
            :href="contactHref(contact)"
            class="specialist-card__row specialist-card__row--link"
          >
            <svg v-if="isEmail(contact)" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#07979F" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3.6 7l8.4 6 8.4-6" /></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#07979F" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5C4 5.7 4.7 5 5.5 5h3l1.6 4-2 1.4a11 11 0 0 0 5.5 5.5l1.4-2 4 1.6v3c0 .8-.7 1.5-1.5 1.5A15 15 0 0 1 4 6.5z" /></svg>
            <span>{{ contact }}</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.specialists {
  padding: 30px 36px 48px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.specialists__intro {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.specialists__title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.specialists__subtitle {
  font-size: 15px;
  color: #4b5f68;
  max-width: 660px;
  line-height: 1.6;
}

.urgency {
  background: #f0eaf5;
  border-radius: 22px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.urgency__icon {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 999px;
  background: #5c4a75;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.urgency__copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.urgency__title {
  font-size: 17px;
  font-weight: 800;
  color: #3f3358;
}

.urgency__description {
  font-size: 14px;
  line-height: 1.55;
  color: #4a3d63;
}

.urgency__btn {
  height: 44px;
  padding: 0 22px;
  border-radius: 999px;
  border: 0;
  background: #5c4a75;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
}

.urgency__btn:hover {
  background: #3f3358;
}

.specialists__empty {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  padding: 22px;
  font-size: 14px;
  color: #5f767e;
}

.specialists__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: 20px;
}

.specialist-card {
  background: #fff;
  border-radius: 26px;
  border: 1px solid #eaf1f2;
  padding: 26px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.specialist-card__header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.specialist-card__avatar {
  width: 64px;
  height: 64px;
  flex: 0 0 64px;
  border-radius: 20px;
  background: #f0eaf5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.specialist-card__avatar img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.specialist-card__heading {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.specialist-card__name {
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.25;
}

.specialist-card__badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: #dbf2f4;
  color: #065c5d;
  font-size: 12px;
  font-weight: 700;
}

.specialist-card__section {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.specialist-card__label {
  font-size: 12px;
  font-weight: 700;
  color: #5f767e;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.specialist-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.specialist-card__chip {
  height: 32px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: #f4f8f9;
  border: 1px solid #e2ecee;
  color: #31474f;
  font-size: 13px;
  font-weight: 600;
}

.specialist-card__row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 14px;
  color: #0e2a36;
  line-height: 1.5;
  text-decoration: none;
}

.specialist-card__row--link {
  color: #0e2a36;
}

.specialist-card__row--link:hover {
  color: #07979f;
}

@media (max-width: 720px) {
  .specialists {
    padding: 20px 18px 40px;
  }

  .specialists__grid {
    grid-template-columns: 1fr;
  }

  .urgency {
    flex-wrap: wrap;
  }
}
</style>
