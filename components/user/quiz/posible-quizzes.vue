<script setup lang="ts">
import {
  type IQuizAvaibleResponse,
  type IQuizzesAvaibleResponse,
} from '~/interfaces/quizzes/quiz-preview.interface'
import { useAuthStore } from '~/store/auth'

const posibleQuizzes: Ref<IQuizzesAvaibleResponse> = ref({
  questionnaires: [] as IQuizAvaibleResponse[],
  count: 0,
})
const { $axios } = useNuxtApp()
const isLoading = ref(true)

const authStore = useAuthStore()

onMounted(async () => {
  authStore.refreshAuth()

  try {
    isLoading.value = true
    const { data } = await $axios.get<IQuizzesAvaibleResponse>(
      `/questionnaire/available/${authStore.user?._id}`,
    )
    posibleQuizzes.value = data
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="quizzes">
    <div v-if="isLoading" class="quizzes__loading">
      <span class="quizzes__spinner" />
      <span>Buscando tus cuestionarios…</span>
    </div>

    <template v-else>
      <header class="quizzes__header">
        <span class="quizzes__eyebrow">Cuestionarios</span>
        <h1 class="quizzes__title">Responder un cuestionario</h1>
        <p class="quizzes__intro">
          <template v-if="posibleQuizzes.count > 0">
            Tu organización tiene {{ posibleQuizzes.count }}
            {{ posibleQuizzes.count === 1 ? 'cuestionario' : 'cuestionarios' }}
            {{ posibleQuizzes.count === 1 ? 'disponible' : 'disponibles' }}.
            Responde el que creas que nos ayuda a darte mejores recomendaciones
            según cómo te sientes.
          </template>
          <template v-else>
            Por ahora tu organización no tiene cuestionarios disponibles. Te
            avisaremos en cuanto se publique uno nuevo.
          </template>
        </p>
      </header>

      <div v-if="posibleQuizzes.questionnaires.length" class="quizzes__grid">
        <article
          v-for="quiz in posibleQuizzes.questionnaires"
          :key="quiz._id"
          class="quizzes__card"
        >
          <span class="quizzes__badge">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#065c5d"
              stroke-width="2.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="8" y="2" width="8" height="4" rx="1" />
              <path
                d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
              />
              <path d="M9 12h6M9 16h4" />
            </svg>
          </span>
          <div class="quizzes__copy">
            <h2 class="quizzes__card-title">{{ quiz.title }}</h2>
            <p class="quizzes__card-text">{{ quiz.description }}</p>
          </div>
          <NuxtLink :to="`/user/quiz/${quiz._id}`" class="quizzes__cta">
            Responder el cuestionario
          </NuxtLink>
        </article>
      </div>
    </template>
  </div>
</template>

<style scoped>
.quizzes {
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
  background: #f4f8f9;
  min-height: 100vh;
  padding: 24px 36px 48px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.quizzes__loading {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #5c7078;
}

.quizzes__spinner {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: 3px solid #dbf2f4;
  border-top-color: #07979f;
  animation: quizzes-spin 0.8s linear infinite;
}

@keyframes quizzes-spin {
  to {
    transform: rotate(360deg);
  }
}

.quizzes__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 720px;
}

.quizzes__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5f767e;
}

.quizzes__title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.quizzes__intro {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #4b5f68;
  text-wrap: pretty;
}

.quizzes__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
}

.quizzes__card {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  box-shadow: 0 6px 20px -14px rgba(6, 92, 93, 0.35);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quizzes__badge {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: #dbf2f4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.quizzes__badge svg {
  width: 22px;
  height: 22px;
}

.quizzes__copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quizzes__card-title {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.01em;
  text-wrap: pretty;
}

.quizzes__card-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #5f767e;
  text-wrap: pretty;
}

.quizzes__cta {
  align-self: flex-start;
  height: 46px;
  padding: 0 24px;
  border-radius: 999px;
  background: #065c5d;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: background-color 0.15s ease;
}

.quizzes__cta:hover {
  background: #07979f;
  color: #fff;
}

@media (max-width: 700px) {
  .quizzes {
    padding: 18px 16px 32px;
  }

  .quizzes__title {
    font-size: 22px;
  }

  .quizzes__cta {
    align-self: stretch;
    justify-content: center;
  }
}
</style>
