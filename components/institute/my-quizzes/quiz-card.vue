<script setup lang="ts">
import BuilderDefinitionView from './builder-definition-view.vue'
import type { IInstituteQuizCard } from '~/interfaces/quizzes/institute-quiz.interface'

const props = defineProps<{
  quiz: IInstituteQuizCard
  saving?: boolean
  error?: string
}>()

defineEmits<{ 'set-active': [active: boolean] }>()

const definitionOpen = ref(false)

const formatNumber = (value: number) => value.toLocaleString('es-MX')

const statusLabel = computed(() => {
  if (props.quiz.readonly) return 'Base de Kairos · solo lectura'
  if (props.quiz.status === 'draft') return 'Borrador'
  return props.quiz.active ? 'Activo' : 'Inactivo'
})

/**
 * El conteo bruto no dice si el cuestionario funcionó. Con grupos asignados hay
 * un denominador real —cuántos alumnos podían responderlo— y ese porcentaje es
 * lo que se lee de un vistazo; sin grupos solo existe el total.
 */
const responsesLabel = computed(() => {
  const responses = props.quiz.responses
  if (!responses) return null

  const answers = responses.total === 1 ? 'respuesta' : 'respuestas'
  if (responses.potential > 0) {
    return `${formatNumber(responses.total)} de ${formatNumber(responses.potential)} alumnos · ${responses.responseRate}%`
  }

  return `${formatNumber(responses.total)} ${answers}`
})

const questionsLabel = computed(() =>
  props.quiz.questionsCount === 1
    ? '1 pregunta'
    : `${formatNumber(props.quiz.questionsCount)} preguntas`,
)
</script>

<template>
  <article class="quiz-card" :class="{ 'quiz-card--readonly': quiz.readonly }">
    <span
      class="quiz-card__status"
      :class="{ 'quiz-card__status--paused': !quiz.active && !quiz.readonly }"
    >
      {{ statusLabel }}
    </span>

    <h3 class="quiz-card__title">{{ quiz.title }}</h3>

    <p class="quiz-card__description">{{ quiz.description }}</p>

    <dl class="quiz-card__meta">
      <div class="quiz-card__meta-row">
        <dt class="quiz-card__meta-label">Preguntas</dt>
        <dd class="quiz-card__meta-value">{{ questionsLabel }}</dd>
      </div>
      <div class="quiz-card__meta-row">
        <dt class="quiz-card__meta-label">Le llega a</dt>
        <dd class="quiz-card__meta-value">{{ quiz.audienceLabel }}</dd>
      </div>
      <div v-if="responsesLabel" class="quiz-card__meta-row">
        <dt class="quiz-card__meta-label">Respuestas</dt>
        <dd class="quiz-card__meta-value">{{ responsesLabel }}</dd>
      </div>
    </dl>

    <div v-if="!quiz.readonly" class="quiz-card__availability">
      <button
        type="button"
        role="switch"
        class="quiz-card__toggle"
        :aria-checked="quiz.active"
        :aria-label="`Cuestionario activo: ${quiz.title}`"
        :aria-describedby="
          quiz.status === 'draft' ? `draft-note-${quiz.id}` : undefined
        "
        :disabled="saving || quiz.status === 'draft'"
        :aria-busy="saving"
        @click="$emit('set-active', !quiz.active)"
      >
        <span class="quiz-card__track" aria-hidden="true"><span /></span>
        <span>{{
          saving ? 'Guardando…' : quiz.active ? 'Activo' : 'Inactivo'
        }}</span>
      </button>
      <p
        v-if="quiz.status === 'draft'"
        :id="`draft-note-${quiz.id}`"
        class="quiz-card__hint"
      >
        Publica el borrador desde Editar para activarlo.
      </p>
      <p v-if="error" class="quiz-card__error" role="alert">{{ error }}</p>
    </div>
    <footer class="quiz-card__footer">
      <span v-if="quiz.updatedLabel" class="quiz-card__updated">
        {{ quiz.updatedLabel }}
      </span>

      <div class="quiz-card__actions">
        <button
          type="button"
          class="quiz-card__button quiz-card__button--ghost"
          :disabled="quiz.schemaVersion !== 2"
          @click="definitionOpen = true"
        >
          Ver preguntas
        </button>
        <NuxtLink
          v-if="!quiz.readonly && quiz.schemaVersion === 2 && !saving"
          :to="`/institute/quizzes/${quiz.id}/edit`"
          class="quiz-card__button quiz-card__button--primary"
          >Editar</NuxtLink
        >
        <button
          v-else-if="!quiz.readonly"
          type="button"
          class="quiz-card__button quiz-card__button--primary"
          disabled
          :title="
            saving
              ? 'Espera a que termine el guardado'
              : 'La edición de cuestionarios anteriores aún no está disponible'
          "
        >
          Editar
        </button>
        <button
          v-else
          type="button"
          class="quiz-card__button quiz-card__button--primary"
          disabled
          title="Duplicar el cuestionario llega en el siguiente paso"
        >
          Duplicar
        </button>
      </div>
    </footer>
    <v-dialog
      v-model="definitionOpen"
      max-width="900"
      scrollable
      aria-label="Definición guardada del cuestionario"
    >
      <BuilderDefinitionView
        v-if="definitionOpen"
        :id="quiz.id"
        @close="definitionOpen = false"
      />
    </v-dialog>
  </article>
</template>

<style scoped>
.quiz-card {
  display: flex;
  flex-direction: column;
  gap: 11px;
  background: #fff;
  border: 1px solid #efebf5;
  border-radius: 22px;
  padding: 22px;
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
}

.quiz-card--readonly {
  background: #3c2f52;
  border-color: #3c2f52;
  color: #fff;
}

.quiz-card__status {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  height: 25px;
  padding: 0 11px;
  border-radius: 999px;
  background: #dbf2f4;
  color: #065c5d;
  font-size: 11px;
  font-weight: 700;
}

.quiz-card__status--paused {
  background: #f0eaf5;
  color: #5c4a75;
}

.quiz-card--readonly .quiz-card__status {
  background: #523f6e;
  color: #e6dff0;
}

.quiz-card__title {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.quiz-card__description {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: #4b5f68;
  text-wrap: pretty;
}

.quiz-card--readonly .quiz-card__description {
  color: #c3b6d8;
}

.quiz-card__meta {
  margin: 4px 0 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
  /* Empuja el pie hacia abajo para que todas las tarjetas cierren parejas. */
  flex: 1;
}

.quiz-card__meta-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.quiz-card__meta-label {
  margin: 0;
  font-size: 13px;
  color: #6b6080;
}

.quiz-card--readonly .quiz-card__meta-label {
  color: #b3a3cc;
}

.quiz-card__meta-value {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  text-align: right;
  color: #3c2f52;
}

.quiz-card--readonly .quiz-card__meta-value {
  color: #fff;
}

.quiz-card__footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid #f0edf5;
}

.quiz-card--readonly .quiz-card__footer {
  border-top-color: #4e3f68;
}

.quiz-card__updated {
  font-size: 12px;
  font-weight: 600;
  color: #6b6080;
}

.quiz-card--readonly .quiz-card__updated {
  color: #b3a3cc;
}

.quiz-card__actions {
  display: flex;
  gap: 10px;
}

.quiz-card__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  flex: 1;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  font-family: 'Figtree', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.quiz-card__button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.quiz-card__button--ghost {
  border: 2px solid #ded6ea;
  background: #fff;
  color: #3c2f52;
}

.quiz-card__button--primary {
  border: 0;
  background: #6d5f88;
  color: #fff;
}

.quiz-card--readonly .quiz-card__button--ghost {
  border-color: #6d5f88;
  background: transparent;
  color: #fff;
}

.quiz-card--readonly .quiz-card__button--primary {
  background: #cbadd8;
  color: #3c2f52;
}
.quiz-card__toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  border: 0;
  background: transparent;
  color: #3c2f52;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
}
.quiz-card__toggle:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.quiz-card__track {
  display: inline-flex;
  align-items: center;
  width: 44px;
  height: 26px;
  padding: 3px;
  border: 2px solid #6d5f88;
  border-radius: 999px;
  background: #f0eaf5;
}
.quiz-card__track > span {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #6d5f88;
}
.quiz-card__toggle[aria-checked='true'] .quiz-card__track {
  background: #6d5f88;
  justify-content: flex-end;
}
.quiz-card__toggle[aria-checked='true'] .quiz-card__track > span {
  background: #fff;
}
.quiz-card__button:focus-visible,
.quiz-card__toggle:focus-visible {
  outline: 3px solid #6d5f88;
  outline-offset: 4px;
}
.quiz-card__hint,
.quiz-card__error {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: #6b6080;
}
.quiz-card__error {
  color: #8a3d3d;
}
.quiz-card__actions {
  flex-wrap: wrap;
}
</style>
