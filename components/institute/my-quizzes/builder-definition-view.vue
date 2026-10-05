<script setup lang="ts">
import type {
  QuestionnaireDefinition,
  DefinitionQuestion,
} from '~/interfaces/quizzes/quiz-builder.interface'
import BuilderDimensionEditor from './builder-dimension-editor.vue'
import { createQuestion, questionTypes } from './quiz-builder-model'
const props = defineProps<{ id: string }>()
defineEmits<{ close: [] }>()
const { $axios } = useNuxtApp()
const definition = ref<QuestionnaireDefinition | null>(null)
const error = ref('')
const loading = ref(true)
const scoredQuestions = computed(
  () =>
    definition.value?.questions
      .filter((q) => q.scoring.mode === 'scored')
      .map((q) => ({ ...createQuestion(), id: q._id, text: q.text })) || [],
)
function conditionLabel(question: DefinitionQuestion) {
  const condition = question.visibleWhen
  if (!condition || !definition.value) return ''
  const parent = definition.value.questions.find(
    (q) => q._id === condition.questionId,
  )
  return `Se muestra si «${parent?.text}» está visible y responde: ${parent?.options
    .filter((o) => condition.optionIds.includes(o._id))
    .map((o) => o.text)
    .join(' o ')}.`
}
async function load() {
  loading.value = true
  error.value = ''
  try {
    definition.value = (
      await $axios.get<QuestionnaireDefinition>(
        `/questionnaire/${props.id}/definition`,
      )
    ).data
  } catch {
    error.value =
      'No pudimos cargar la definición guardada. Vuelve a intentarlo.'
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>
<template>
  <div class="quiz-builder qb-preview-dialog">
    <header class="qb-row">
      <div>
        <p class="qb-eyebrow">
          {{
            definition?.status === 'published'
              ? 'Cuestionario publicado'
              : 'Borrador guardado'
          }}
          · Solo lectura
        </p>
        <h2>{{ definition?.title || 'Cuestionario' }}</h2>
      </div>
      <button
        type="button"
        class="qb-icon"
        aria-label="Cerrar definición"
        @click="$emit('close')"
      >
        <v-icon icon="mdi-close" />
      </button>
    </header>
    <div class="qb-preview-content">
      <p v-if="loading" role="status">Cargando cuestionario…</p>
      <div v-else-if="error" role="alert">
        <p>{{ error }}</p>
        <button type="button" class="qb-button" @click="load">
          Reintentar
        </button>
      </div>
      <template v-else-if="definition">
        <p>{{ definition.description }}</p>
        <section
          v-for="(question, index) in definition.questions"
          :key="question._id"
          class="qb-panel"
        >
          <h3>{{ index + 1 }}. {{ question.text }}</h3>
          <p v-if="question.helpText" class="qb-muted">
            {{ question.helpText }}
          </p>
          <p class="qb-muted">
            {{ questionTypes.find((t) => t.value === question.type)?.label }} ·
            {{
              question.required ? 'Obligatoria cuando sea visible' : 'Opcional'
            }}
            ·
            {{
              question.scoring.mode === 'informational'
                ? 'Informativa'
                : 'Con puntuación'
            }}
          </p>
          <p v-if="question.visibleWhen" class="qb-rule">
            {{ conditionLabel(question) }}
          </p>
          <ul v-if="question.options.length">
            <li v-for="option in question.options" :key="option._id">
              {{ option.text }} ·
              {{
                option.score === null
                  ? 'Sin puntuación'
                  : `${option.score} puntos`
              }}
            </li>
          </ul>
          <p v-if="question.type === 'number'">
            Rango: {{ question.constraints.min }} a
            {{ question.constraints.max }}.
          </p>
          <p v-if="question.type === 'text'">
            Hasta {{ question.constraints.maxLength }} caracteres.
          </p>
        </section>
        <h2>Evaluación guardada</h2>
        <p v-if="!definition.evaluationConfiguration.dimensions.length">
          Sin dimensiones.
        </p>
        <fieldset
          v-for="(dimension, index) in definition.evaluationConfiguration
            .dimensions"
          :key="dimension._id"
          disabled
          class="qb-panel qb-evaluation-group"
        >
          <legend>{{ dimension.label }}</legend>
          <BuilderDimensionEditor
            v-model="definition.evaluationConfiguration.dimensions[index]"
            :questions="scoredQuestions"
          />
          <p
            v-for="alarm in definition.evaluationConfiguration.alarms.filter(
              (a) => a.dimensionId === dimension._id,
            )"
            :key="alarm.dimensionId"
          >
            Alarma:
            {{
              alarm.enabled
                ? alarm.risks
                    .map(
                      (r) =>
                        ({ low: 'bajo', moderate: 'moderado', high: 'alto' })[
                          r
                        ],
                    )
                    .join(' o ')
                : 'Deshabilitada'
            }}.
          </p>
        </fieldset>
        <fieldset
          v-if="definition.evaluationConfiguration.overall"
          disabled
          class="qb-panel qb-evaluation-group"
        >
          <legend>Calificación global</legend>
          <BuilderDimensionEditor
            v-model="definition.evaluationConfiguration.overall"
            :questions="scoredQuestions"
          />
        </fieldset>
        <p>
          Etiqueta final: {{ definition.evaluationConfiguration.alarmLabel }}.
          Se activa si alguna dimensión cumple su condición.
        </p>
      </template>
    </div>
  </div>
</template>
<style src="./quiz-builder.css" />
