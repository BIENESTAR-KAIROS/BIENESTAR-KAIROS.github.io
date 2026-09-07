<script setup lang="ts">
import QuizCard from './quiz-card.vue'
import { useMyQuizzes } from './use-my-quizzes'

const { state, errorMessage, quizzes, activeCount, load } = useMyQuizzes()

const formatNumber = (value: number) => value.toLocaleString('es-MX')

const headerTitle = computed(() => {
  if (state.value === 'loading') return 'Buscando tus cuestionarios…'
  if (state.value === 'error') return 'No pudimos leer tus cuestionarios'
  if (state.value === 'empty') return 'Todavía no hay cuestionarios'

  const total = quizzes.value.length
  const noun = total === 1 ? 'cuestionario' : 'cuestionarios'
  const active =
    activeCount.value === 1 ? '1 activo' : `${activeCount.value} activos`

  return `${formatNumber(total)} ${noun} · ${active}`
})

onMounted(load)
</script>

<template>
  <div class="quizzes">
    <header class="quizzes__header">
      <div class="quizzes__heading">
        <span class="quizzes__eyebrow">Mis cuestionarios</span>
        <span class="quizzes__title">{{ headerTitle }}</span>
      </div>

      <button
        type="button"
        class="quizzes__create"
        disabled
        title="Crear cuestionarios llega en el siguiente paso"
      >
        Crear cuestionario
      </button>
    </header>

    <p class="quizzes__intro">
      Cada cuestionario que publicas alimenta las respuestas y las estadísticas
      de tu institución. Aquí ves cuáles están activos, a quién le llegan y
      cuánta gente ya respondió.
    </p>

    <p v-if="state === 'loading'" class="quizzes__banner">
      Cargando tus cuestionarios…
    </p>

    <p
      v-else-if="state === 'error'"
      class="quizzes__banner quizzes__banner--error"
    >
      {{ errorMessage }}
    </p>

    <div v-else class="quizzes__grid">
      <QuizCard v-for="quiz in quizzes" :key="quiz.id" :quiz="quiz" />

      <div v-if="state === 'empty'" class="quizzes__empty" role="note">
        <span class="quizzes__empty-title">
          Tu institución aún no tiene cuestionarios
        </span>
        <span class="quizzes__empty-text">
          En cuanto publiques el primero aparecerá aquí, con sus preguntas, a
          quién le llega y cuántos alumnos han respondido.
        </span>
      </div>

      <!-- La tarjeta de alta ya vive en la retícula; se enciende al construir
           el flujo de creación. -->
      <div class="quizzes__new" aria-disabled="true">
        <span class="quizzes__new-icon">
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8475a0"
            stroke-width="2.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        <span class="quizzes__new-title">Nuevo cuestionario</span>
        <span class="quizzes__new-text">
          Para un grupo, una carrera o un momento del semestre.
        </span>
        <span class="quizzes__new-soon">Disponible en el siguiente paso</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quizzes {
  min-height: 100%;
  background: #f5f4f8;
  padding: 24px 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  font-family: 'Figtree', sans-serif;
}

.quizzes__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.quizzes__heading {
  display: flex;
  flex-direction: column;
}

.quizzes__eyebrow {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b6080;
}

.quizzes__title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #3c2f52;
}

.quizzes__create {
  height: 42px;
  padding: 0 22px;
  border: 0;
  border-radius: 999px;
  background: #8475a0;
  color: #fff;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.quizzes__create:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quizzes__intro {
  margin: 0;
  max-width: 720px;
  font-size: 14px;
  line-height: 1.6;
  color: #4b3f60;
  text-wrap: pretty;
}

.quizzes__banner {
  margin: 0;
  padding: 18px 22px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #efebf5;
  font-size: 14px;
  color: #6b6080;
}

.quizzes__banner--error {
  border-color: #f2d9d9;
  background: #fdf3f3;
  color: #8a3d3d;
}

.quizzes__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  align-items: stretch;
}

.quizzes__empty,
.quizzes__new {
  display: flex;
  flex-direction: column;
  border-radius: 22px;
  padding: 22px;
}

.quizzes__empty {
  gap: 8px;
  justify-content: center;
  background: #fff;
  border: 1px solid #efebf5;
}

.quizzes__empty-title {
  font-size: 17px;
  font-weight: 800;
  color: #3c2f52;
}

.quizzes__empty-text {
  font-size: 14px;
  line-height: 1.55;
  color: #4b5f68;
  text-wrap: pretty;
}

.quizzes__new {
  gap: 9px;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 220px;
  border: 2px dashed #ded6ea;
}

.quizzes__new-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  background: #fff;
}

.quizzes__new-title {
  font-size: 15px;
  font-weight: 700;
  color: #4b3f60;
}

.quizzes__new-text {
  max-width: 190px;
  font-size: 13px;
  line-height: 1.5;
  color: #7d7391;
}

.quizzes__new-soon {
  font-size: 12px;
  font-weight: 700;
  color: #9a90ad;
}

@media (max-width: 1100px) {
  .quizzes__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .quizzes {
    padding: 20px 16px 32px;
  }

  .quizzes__grid {
    grid-template-columns: 1fr;
  }

  .quizzes__create {
    width: 100%;
  }
}
</style>
