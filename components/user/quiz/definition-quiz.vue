<script setup lang="ts">
import axios from 'axios'
import { useAuthStore } from '~/store/auth'
import type { DefinitionSubmissionResult } from '~/interfaces/quizzes/definition-result.interface'
import DefinitionQuestion from './definition-question.vue'
import QuestionnaireFlowState from './questionnaire-flow-state.vue'
import type {
  StudentAnswer,
  StudentAnswers,
  StudentQuestionnaireDefinition,
} from '~/interfaces/quizzes/student-questionnaire.interface'
import {
  hasStudentAnswer,
  retainVisibleStudentAnswers,
  studentAnswerError,
  visibleStudentQuestions,
} from '~/utils/helpers/student-questionnaire'

const route = useRoute()
const { $axios } = useNuxtApp()
const definition = ref<StudentQuestionnaireDefinition | null>(null)
const answers = ref<StudentAnswers>({})
const currentId = ref('')
const loading = ref(true)
const failed = ref(false)
const showHistory = ref(false)
const showErrors = ref(false)
const submitting = ref(false)
const submissionError = ref('')
const saved = ref<DefinitionSubmissionResult | null>(null)
const resultRecommendations = computed(() => {
  if (!saved.value) return []
  const evaluation = saved.value.evaluation
  return [
    ...new Set([
      ...saved.value.recommendations.map((item) => item.text),
      ...[evaluation.overall, ...evaluation.dimensions]
        .map((item) => item?.recommendations)
        .filter((text): text is string => !!text),
    ]),
  ]
})
const auth = useAuthStore()
const visibilityMessage = ref('')
const questionHeading = ref<HTMLElement | null>(null)
const visible = computed(() =>
  visibleStudentQuestions(definition.value?.questions ?? [], answers.value),
)
const position = computed(() =>
  visible.value.findIndex((question) => question._id === currentId.value),
)
const current = computed(() => visible.value[position.value])
const answered = computed(
  () =>
    visible.value.filter((q) => hasStudentAnswer(answers.value[q._id])).length,
)
const errors = computed(
  () =>
    new Map(
      visible.value.map((q) => [
        q._id,
        studentAnswerError(q, answers.value[q._id]),
      ]),
    ),
)
const remaining = computed(
  () => [...errors.value.values()].filter(Boolean).length,
)

async function load() {
  loading.value = true
  failed.value = false
  try {
    const { data } = await $axios.get<StudentQuestionnaireDefinition>(
      `/questionnaire/student/${route.params.id}`,
    )
    if (data.schemaVersion !== 2 || !data.questions.length)
      throw new Error('Unsupported questionnaire definition')
    definition.value = data
    answers.value = {}
    currentId.value = visible.value[0]?._id ?? ''
    if (!currentId.value) throw new Error('No visible questions')
    saved.value = null
    submissionError.value = ''
    showErrors.value = false
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}
onMounted(load)

function setAnswer(value: StudentAnswer) {
  if (!definition.value || !current.value) return
  const previous = new Set(visible.value.map((q) => q._id))
  answers.value = retainVisibleStudentAnswers(definition.value.questions, {
    ...answers.value,
    [current.value._id]: value,
  })
  const next = new Set(visible.value.map((q) => q._id))
  const hidden = [...previous].filter((id) => !next.has(id)).length
  const added = [...next].filter((id) => !previous.has(id)).length
  visibilityMessage.value = [
    hidden ? 'Se ocultaron preguntas y se borraron sus respuestas.' : '',
    added ? 'Hay nuevas preguntas disponibles según tu respuesta.' : '',
  ]
    .filter(Boolean)
    .join(' ')
  submissionError.value = ''
}
async function selectQuestion(id: string) {
  currentId.value = id
  showHistory.value = false
  showErrors.value = false
  await nextTick()
  questionHeading.value?.focus()
}
function next() {
  showErrors.value = true
  if (!current.value || errors.value.get(current.value._id)) return
  const nextQuestion = visible.value[position.value + 1]
  if (nextQuestion) void selectQuestion(nextQuestion._id)
}
async function submit() {
  if (submitting.value || saved.value || !definition.value || !auth.user) return
  const invalid = visible.value.find((q) => errors.value.get(q._id))
  if (invalid) {
    await selectQuestion(invalid._id)
    showErrors.value = true
    return
  }
  submitting.value = true
  submissionError.value = ''
  try {
    saved.value = (
      await $axios.post<DefinitionSubmissionResult>(
        `/questionnaire/${definition.value._id}/responses`,
        {
          studentId: auth.user._id,
          questionnaireId: definition.value._id,
          revision: definition.value.revision,
          attemptId: definition.value.attemptId,
          responses: visible.value
            .filter((q) => hasStudentAnswer(answers.value[q._id]))
            .map((q) => ({
              questionId: q._id,
              response: answers.value[q._id],
            })),
        },
      )
    ).data
    await nextTick()
    questionHeading.value?.focus()
  } catch (error) {
    const text: unknown = axios.isAxiosError(error)
      ? error.response?.data?.message
      : null
    submissionError.value =
      typeof text === 'string'
        ? text
        : 'No pudimos guardar tus respuestas. Puedes volver a intentarlo.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <QuestionnaireFlowState
    v-if="loading"
    loading
    message="Cargando tu cuestionario…"
  />
  <QuestionnaireFlowState
    v-else-if="failed || !definition || !current"
    error
    message="No pudimos cargar este cuestionario. Vuelve a intentarlo."
    @retry="load"
  />
  <main v-else class="definition-quiz">
    <header class="definition-quiz__header">
      <div>
        <span class="definition-quiz__eyebrow">Cuestionarios</span>
        <h1>{{ definition.title }}</h1>
        <p v-if="definition.description">{{ definition.description }}</p>
      </div>
      <div class="definition-quiz__progress">
        <span>{{ answered }} de {{ visible.length }} respondidas</span>
        <progress
          :value="answered"
          :max="visible.length"
          aria-label="Preguntas respondidas"
        />
      </div>
    </header>
    <section v-if="saved" class="definition-quiz__card" role="status">
      <h2 ref="questionHeading" tabindex="-1">Tus respuestas se guardaron</h2>
      <p>Gracias por completar el cuestionario.</p>
      <template v-if="resultRecommendations.length">
        <h3>Recomendaciones para ti</h3>
        <p
          v-for="recommendation in resultRecommendations"
          :key="recommendation"
        >
          {{ recommendation }}
        </p>
      </template>
      <NuxtLink to="/user/quiz" class="definition-quiz__exit"
        >Continuar con mis cuestionarios</NuxtLink
      >
    </section>
    <fieldset v-else :disabled="submitting" class="definition-quiz__card">
      <h2 ref="questionHeading" class="definition-quiz__step" tabindex="-1">
        Pregunta {{ position + 1 }} de {{ visible.length }}
        <span v-if="current.category"> · {{ current.category }}</span>
      </h2>
      <DefinitionQuestion
        :key="current._id"
        :question="current"
        :answer="answers[current._id]"
        :error="showErrors ? errors.get(current._id) : null"
        @answer="setAnswer"
      />
      <p class="definition-quiz__status" role="status">
        {{ visibilityMessage }}
      </p>
      <nav class="definition-quiz__navigation" aria-label="Preguntas">
        <div v-if="showHistory" class="definition-quiz__history">
          <button
            v-for="(question, index) in visible"
            :key="question._id"
            type="button"
            class="definition-quiz__chip"
            :class="{
              'is-answered': hasStudentAnswer(answers[question._id]),
            }"
            :aria-current="question._id === currentId ? 'step' : undefined"
            :aria-label="`Pregunta ${index + 1}${
              hasStudentAnswer(answers[question._id]) ? ', respondida' : ''
            }`"
            @click="selectQuestion(question._id)"
          >
            {{ index + 1 }}
          </button>
        </div>
        <p v-if="submissionError" role="alert">{{ submissionError }}</p>
        <p v-if="remaining > 0">
          {{ remaining }}
          {{ remaining === 1 ? 'pregunta pendiente' : 'preguntas pendientes' }}
          de responder o revisar.
        </p>
        <div class="definition-quiz__actions">
          <button
            v-if="definition.canAccessQuestionHistory"
            type="button"
            :aria-expanded="showHistory"
            @click="showHistory = !showHistory"
          >
            Historial
          </button>
          <button
            type="button"
            :disabled="position <= 0"
            @click="selectQuestion(visible[position - 1]._id)"
          >
            Anterior
          </button>
          <button
            v-if="position < visible.length - 1"
            type="button"
            class="definition-quiz__primary"
            @click="next"
          >
            Siguiente
          </button>
          <button
            v-else
            type="button"
            class="definition-quiz__primary"
            @click="submit"
          >
            {{ submitting ? 'Guardando…' : 'Guardar respuestas' }}
          </button>
        </div>
      </nav>
    </fieldset>
    <NuxtLink to="/user/dashboard" class="definition-quiz__exit">
      Volver al inicio
    </NuxtLink>
  </main>
</template>

<style scoped>
.definition-quiz {
  min-height: 100vh;
  padding: 24px 36px 48px;
  background: #f4f8f9;
  color: #0e2a36;
  font-family: 'Figtree', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.definition-quiz > * {
  width: 100%;
  max-width: 880px;
}
.definition-quiz__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  overflow-wrap: anywhere;
}
h1 {
  font-size: 28px;
  font-weight: 800;
  margin: 4px 0 12px;
}
p {
  line-height: 1.6;
}
.definition-quiz__eyebrow,
.definition-quiz__step {
  font-size: 13px;
  font-weight: 700;
  color: #4b5f68;
}
.definition-quiz__progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #065c5d;
}
progress {
  width: 220px;
  max-width: 100%;
  height: 10px;
  accent-color: #065c5d;
}
.definition-quiz__notice {
  padding: 20px;
  border-radius: 20px;
  background: #dbf2f4;
  font-size: 14px;
}
.definition-quiz__notice p {
  margin-top: 8px;
}
.definition-quiz__card {
  padding: 30px;
  border: 1px solid #eaf1f2;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 6px 20px -12px rgba(6, 92, 93, 0.35);
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.definition-quiz__status {
  font-size: 14px;
  color: #4b5f68;
}
.definition-quiz__status:empty {
  display: none;
}
.definition-quiz__navigation {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 1px solid #eaf1f2;
  padding-top: 16px;
}
.definition-quiz__actions,
.definition-quiz__history {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
button {
  min-height: 46px;
  padding: 10px 20px;
  border: 2px solid #cfdde1;
  border-radius: 999px;
  font: inherit;
  font-weight: 700;
  color: #0e2a36;
  background: #fff;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
button:hover:not(:disabled) {
  border-color: #065c5d;
}
button.definition-quiz__primary,
button[aria-current='step'] {
  background: #065c5d;
  border-color: #065c5d;
  color: #fff;
}
button.definition-quiz__primary:hover {
  background: #0e2a36;
}
.definition-quiz__chip {
  min-width: 46px;
  padding: 8px 12px;
}
.definition-quiz__chip.is-answered {
  border-color: #07979f;
}
.definition-quiz__exit {
  color: #065c5d;
  min-height: 44px;
  padding: 10px 0;
  text-align: center;
}
:is(button, a, h2):focus-visible {
  outline: 3px solid #07979f;
  outline-offset: 4px;
}
@media (max-width: 700px) {
  .definition-quiz {
    padding: 20px 18px 40px;
  }
  h1 {
    font-size: 22px;
  }
  .definition-quiz__card {
    padding: 22px 18px;
    border-radius: 20px;
  }
  .definition-quiz__actions button {
    flex: 1 1 auto;
    padding: 10px 14px;
  }
}
</style>
