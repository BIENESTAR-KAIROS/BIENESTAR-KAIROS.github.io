<script setup lang="ts">
import { isAxiosError } from 'axios'
import { useAuthStore } from '~/store/auth'
import type {
  CreateQuestionnaireRequest,
  UpdateQuestionnaireRequest,
  QuestionnaireDefinition,
} from '~/interfaces/quizzes/quiz-builder.interface'
import BuilderEvaluationEditor from './builder-evaluation-editor.vue'
import BuilderQuestionEditor from './builder-question-editor.vue'
import BuilderQuestionPreview from './builder-question-preview.vue'
import {
  createEvaluation,
  restoreBuilderQuestions,
  allBuilderQuestions,
  flattenQuestions,
  validateBuilder,
  createExample,
  createQuestion,
  hasOptions,
  questionTypes,
} from './quiz-builder-model'

const props = defineProps<{ questionnaireId?: string }>()
const loading = ref(Boolean(props.questionnaireId))
const loadError = ref('')
const savedDefinition = ref<QuestionnaireDefinition | null>(null)
const publishing = ref(false)
const { $axios } = useNuxtApp()
const auth = useAuthStore()
const evaluation = ref(createEvaluation())
const hasRecommendations = ref(false)
const saving = ref(false)
const errors = ref<string[]>([])
const errorPanel = ref<HTMLElement | null>(null)
const allQuestions = computed(() => allBuilderQuestions(questions.value))
const scoredQuestions = computed(() =>
  allQuestions.value.filter((q) => q.scoringMode === 'scored'),
)
async function saveQuestionnaire(publish = false) {
  if (saving.value || loading.value || loadError.value) return
  const flat = flattenQuestions(questions.value)
  errors.value = validateBuilder(title.value, flat, evaluation.value)
  const institute = auth.user?.institute
  const institution = typeof institute === 'string' ? institute : institute?._id
  if (!institution)
    errors.value.push(
      'No pudimos identificar tu institución. Revisa tu sesión antes de guardar.',
    )
  if (errors.value.length) {
    await nextTick()
    errorPanel.value?.focus()
    return
  }
  saving.value = true
  publishing.value = publish
  // Snapshot the definition so an in-flight request cannot mix edits.
  const configuration = structuredClone(toRaw(evaluation.value))
  for (const dimension of [
    ...configuration.dimensions,
    ...(configuration.overall ? [configuration.overall] : []),
  ]) {
    dimension.skippedQuestions = 'exclude'
    dimension.label = dimension.label.trim()
    if (dimension.method !== 'weighted_mean')
      dimension.items.forEach((item) => {
        item.weight = 1
      })
  }
  const payload: CreateQuestionnaireRequest = {
    hasRecomendations: hasRecommendations.value,
    institution: institution!,
    title: title.value.trim(),
    description: description.value.trim(),
    questions: flat,
    evaluationConfiguration: configuration,
  }
  try {
    let definition: QuestionnaireDefinition
    if (props.questionnaireId) {
      const update: UpdateQuestionnaireRequest = {
        hasRecomendations: payload.hasRecomendations,
        title: payload.title,
        description: payload.description,
        questions: payload.questions,
        evaluationConfiguration: payload.evaluationConfiguration,
        revision: savedDefinition.value?.__v ?? 0,
      }
      definition = (
        await $axios.patch<QuestionnaireDefinition>(
          `/questionnaire/${props.questionnaireId}/definition`,
          update,
        )
      ).data
    } else {
      definition = (
        await $axios.post<QuestionnaireDefinition>('/questionnaire', payload)
      ).data
    }
    savedDefinition.value = definition
    if (publish) {
      savedDefinition.value = (
        await $axios.patch<QuestionnaireDefinition>(
          `/questionnaire/${definition._id}/publish`,
          { revision: definition.__v ?? 0 },
        )
      ).data
    }
    await navigateTo('/institute/quizzes')
  } catch (error: unknown) {
    const detail = isAxiosError<{ message?: string | string[] }>(error)
      ? error.response?.data?.message
      : undefined
    errors.value = Array.isArray(detail)
      ? detail
      : [
          detail ||
            'No pudimos guardar el cuestionario. Tus cambios siguen aquí; vuelve a intentarlo.',
        ]
    await nextTick()
    errorPanel.value?.focus()
  } finally {
    saving.value = false
    publishing.value = false
  }
}
async function loadDefinition() {
  if (!props.questionnaireId) return
  loading.value = true
  loadError.value = ''
  try {
    const { data } = await $axios.get<QuestionnaireDefinition>(
      `/questionnaire/${props.questionnaireId}/definition`,
    )
    const restored = restoreBuilderQuestions(data.questions)
    title.value = data.title
    description.value = data.description
    questions.value = restored
    activeId.value = restored[0].id
    evaluation.value = data.evaluationConfiguration
    hasRecommendations.value = data.hasRecomendations ?? false
    savedDefinition.value = data
  } catch (error) {
    loadError.value = isAxiosError<{ message?: string }>(error)
      ? error.response?.data?.message ||
        'No pudimos cargar el cuestionario. Vuelve a intentarlo.'
      : error instanceof Error
        ? error.message
        : 'No pudimos cargar el cuestionario.'
  } finally {
    loading.value = false
  }
}
onMounted(loadDefinition)
const title = ref('')
const description = ref('')
const questions = ref([createQuestion()])
const activeId = ref(questions.value[0].id)
const activeQuestion = computed(
  () => questions.value.find((question) => question.id === activeId.value)!,
)
const activeIndex = computed(() =>
  questions.value.findIndex((question) => question.id === activeId.value),
)
const previewOpen = ref(false)
const message = ref('')
watch(message, (value, _, onCleanup) => {
  if (!value) return
  const timeout = window.setTimeout(() => {
    message.value = ''
  }, 4500)
  onCleanup(() => window.clearTimeout(timeout))
})
const ruleOptions = ref<string[]>([])
const totalChildren = computed(
  () => allQuestions.value.length - questions.value.length,
)
const rules = computed(() => activeQuestion.value.children)
const triggerLabels = (ids: string[]) =>
  activeQuestion.value.options
    .filter((option) => ids.includes(option.id))
    .map((option) => option.text || 'Opción sin texto')
    .join(' / ')
const typeLabel = (type: string) =>
  questionTypes.find((item) => item.value === type)?.label

watch(
  () => activeQuestion.value.options.map((option) => option.id),
  (ids) => {
    ruleOptions.value = ruleOptions.value.filter((id) => ids.includes(id))
    if (!ruleOptions.value.length) ruleOptions.value = ids.slice(0, 1)
  },
  { immediate: true },
)

function addQuestion(example = false) {
  const question = example ? createExample() : createQuestion()
  questions.value.push(question)
  activeId.value = question.id
  message.value = example
    ? 'Ejemplo añadido al borrador. Puedes editarlo o eliminarlo.'
    : 'Nueva pregunta añadida al borrador.'
}
function removeQuestion() {
  const index = activeIndex.value
  questions.value.splice(index, 1)
  activeId.value = questions.value[Math.max(0, index - 1)].id
  message.value = 'Pregunta eliminada del borrador.'
}
function moveQuestion(direction: number) {
  const index = activeIndex.value
  const target = index + direction
  if (target < 0 || target >= questions.value.length) return
  const [question] = questions.value.splice(index, 1)
  questions.value.splice(target, 0, question)
  message.value = `Pregunta movida a la posición ${target + 1}.`
}
function addRule() {
  if (!ruleOptions.value.length) return
  const child = createQuestion()
  child.triggerOptionIds = [...ruleOptions.value]
  activeQuestion.value.children.push(child)
  message.value = 'Subpregunta añadida con las opciones seleccionadas.'
}
</script>

<template>
  <div class="quiz-builder">
    <header class="qb-header">
      <div class="qb-heading">
        <NuxtLink
          to="/institute/quizzes"
          class="qb-icon qb-back"
          aria-label="Volver a mis cuestionarios"
          ><v-icon icon="mdi-arrow-left" size="22"
        /></NuxtLink>
        <div>
          <p class="qb-eyebrow">
            Mis cuestionarios / {{ questionnaireId ? 'Editar' : 'Crear' }}
          </p>
          <h1>
            {{ questionnaireId ? 'Editar cuestionario' : 'Nuevo cuestionario' }}
          </h1>
        </div>
      </div>
      <div v-if="!loading && !loadError" class="qb-header-actions">
        <span class="qb-badge">{{
          savedDefinition?.status === 'published' ? 'Publicado' : 'Borrador'
        }}</span>
        <button type="button" class="qb-button" @click="previewOpen = true">
          <v-icon icon="mdi-eye-outline" size="18" /> Previsualizar
        </button>
        <button
          type="button"
          class="qb-button"
          :class="{
            'qb-button--primary':
              !questionnaireId || savedDefinition?.status === 'published',
          }"
          :disabled="saving"
          :aria-busy="saving"
          aria-describedby="qb-draft-note"
          @click="saveQuestionnaire()"
        >
          <v-icon icon="mdi-content-save-outline" size="18" />
          {{
            saving && !publishing
              ? 'Guardando…'
              : questionnaireId
                ? 'Guardar cambios'
                : 'Guardar borrador'
          }}
        </button>
        <button
          v-if="questionnaireId && savedDefinition?.status === 'draft'"
          type="button"
          class="qb-button qb-button--primary"
          :disabled="saving"
          :aria-busy="publishing"
          @click="saveQuestionnaire(true)"
        >
          {{ publishing ? 'Publicando…' : 'Guardar y publicar' }}
        </button>
      </div>
    </header>
    <p v-if="loading" class="qb-panel" role="status">Cargando cuestionario…</p>
    <div v-else-if="loadError" class="qb-panel qb-error" role="alert">
      <p>{{ loadError }}</p>
      <button type="button" class="qb-button" @click="loadDefinition">
        Reintentar
      </button>
    </div>
    <fieldset v-else class="qb-body qb-form-body" :disabled="saving">
      <div
        v-if="errors.length"
        ref="errorPanel"
        class="qb-panel qb-error"
        role="alert"
        tabindex="-1"
      >
        <h2>Revisa el cuestionario</h2>
        <ul>
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </div>
      <p id="qb-draft-note" class="qb-notice">
        <v-icon
          icon="mdi-information-outline"
          size="20"
          aria-hidden="true"
        /><span>{{
          savedDefinition?.status === 'published'
            ? 'Los cambios se guardarán en el cuestionario publicado y conservarán su estado activo o inactivo.'
            : 'Guarda el borrador para continuar después. Al publicar quedará inactivo; podrás activarlo desde Mis cuestionarios.'
        }}</span>
      </p>
      <section class="qb-panel qb-details" aria-labelledby="qb-details-title">
        <div class="qb-section-heading">
          <h2 id="qb-details-title">Tu cuestionario</h2>
          <p>Dale un nombre y construye las preguntas para tu comunidad.</p>
        </div>
        <div class="qb-details-fields">
          <label class="qb-field"
            ><span>Nombre del cuestionario</span
            ><input
              v-model="title"
              placeholder="Ej. Bienestar al inicio del semestre"
              maxlength="120"
          /></label>
          <label class="qb-field"
            ><span>Descripción <small>(opcional)</small></span
            ><input
              v-model="description"
              placeholder="¿Qué te gustaría conocer?"
              maxlength="300"
          /></label>
        </div>
      </section>

      <section class="qb-question-nav" aria-label="Preguntas del borrador">
        <div class="qb-row">
          <div>
            <h2>
              Preguntas del cuestionario
              <span class="qb-badge">{{ questions.length }}</span>
            </h2>
            <p class="qb-muted">Selecciona una pregunta para editarla.</p>
          </div>
          <div class="qb-actions">
            <button
              type="button"
              class="qb-button qb-button--text"
              @click="addQuestion(true)"
            >
              Añadir ejemplo de condiciones</button
            ><button
              type="button"
              class="qb-button qb-button--primary"
              @click="addQuestion()"
            >
              + Añadir pregunta
            </button>
          </div>
        </div>
        <div class="qb-question-tabs">
          <button
            v-for="(question, index) in questions"
            :key="question.id"
            type="button"
            class="qb-question-tab"
            :class="{ 'is-selected': activeId === question.id }"
            :aria-pressed="activeId === question.id"
            @click="activeId = question.id"
          >
            <span class="qb-letter">{{ index + 1 }}</span
            ><span
              >{{ question.text || 'Nueva pregunta'
              }}<small>{{ typeLabel(question.type) }}</small></span
            >
          </button>
        </div>
      </section>

      <div class="qb-row qb-edit-heading">
        <h2>
          Pregunta {{ activeIndex + 1 }}
          <span class="qb-muted">de {{ questions.length }}</span>
        </h2>
        <div class="qb-actions">
          <button
            type="button"
            class="qb-icon"
            :disabled="activeIndex === 0"
            aria-label="Mover pregunta antes"
            @click="moveQuestion(-1)"
          >
            <v-icon icon="mdi-arrow-up" size="20" /></button
          ><button
            type="button"
            class="qb-icon"
            :disabled="activeIndex === questions.length - 1"
            aria-label="Mover pregunta después"
            @click="moveQuestion(1)"
          >
            <v-icon icon="mdi-arrow-down" size="20" /></button
          ><button
            type="button"
            class="qb-button qb-button--text qb-danger"
            :disabled="questions.length === 1"
            @click="removeQuestion"
          >
            <v-icon icon="mdi-trash-can-outline" size="18" /> Eliminar pregunta
          </button>
        </div>
      </div>
      <div class="qb-layout">
        <BuilderQuestionEditor
          v-model="questions[activeIndex]"
          @announce="message = $event"
        />
        <aside class="qb-sidebar" aria-label="Reglas y vista previa">
          <section class="qb-panel">
            <div class="qb-section-heading">
              <h2>4 · Reglas condicionales</h2>
              <p>Qué aparece según lo que responda el alumno.</p>
            </div>
            <template v-if="hasOptions(activeQuestion.type)">
              <div v-for="child in rules" :key="child.id" class="qb-rule">
                <span class="qb-eyebrow">Si responde cualquiera de</span>
                <strong>{{ triggerLabels(child.triggerOptionIds) }}</strong>
                <span class="qb-eyebrow">Mostrar</span>
                <p>{{ child.text || 'Subpregunta sin enunciado' }}</p>
              </div>
              <p v-if="!rules.length" class="qb-muted">
                Aún no hay reglas. Añade una subpregunta a una opción.
              </p>
              <div class="qb-rule-form">
                <fieldset class="qb-evaluation-group">
                  <legend>Si responde cualquiera de estas opciones</legend>
                  <label
                    v-for="(option, index) in activeQuestion.options"
                    :key="option.id"
                    class="qb-check"
                  >
                    <input
                      v-model="ruleOptions"
                      type="checkbox"
                      :value="option.id"
                    />
                    <span
                      >{{ String.fromCharCode(65 + index) }} ·
                      {{ option.text || 'Opción sin texto' }}</span
                    >
                  </label>
                </fieldset>
                <button
                  type="button"
                  class="qb-button qb-button--dashed"
                  :disabled="!ruleOptions.length"
                  @click="addRule"
                >
                  + Añadir regla
                </button>
              </div>
              <p class="qb-muted">
                Selecciona una o más opciones para añadir una regla. Las
                subpreguntas se editan debajo de las opciones de respuesta y
                pueden tener más subpreguntas. Solo aparecen cuando su pregunta
                origen está visible y se elige alguna de sus opciones
                activadoras.
              </p>
            </template>
            <p v-else class="qb-muted">
              Las reglas por opción están disponibles para escala, selección
              única, opción múltiple y desplegable.
            </p>
          </section>
          <section class="qb-live">
            <div class="qb-row">
              <h2>Vista del alumno</h2>
              <span class="qb-badge">En vivo</span>
            </div>
            <BuilderQuestionPreview :question="activeQuestion" />
            <p>
              Prueba una respuesta para ver las subpreguntas que activa. No se
              envía ninguna respuesta.
            </p>
          </section>
          <div class="qb-summary">
            <v-icon
              icon="mdi-format-list-bulleted"
              size="22"
              aria-hidden="true"
            />
            <p>
              <strong
                >{{ questions.length }}
                {{
                  questions.length === 1
                    ? 'pregunta principal'
                    : 'preguntas principales'
                }}</strong
              ><br />{{ totalChildren }}
              {{
                totalChildren === 1
                  ? 'subpregunta condicional'
                  : 'subpreguntas condicionales'
              }}
            </p>
          </div>
        </aside>
      </div>
      <BuilderEvaluationEditor
        v-model="evaluation"
        :questions="scoredQuestions"
      />
      <section class="qb-panel" aria-labelledby="qb-recommendations-title">
        <h2 id="qb-recommendations-title">Recomendaciones</h2>
        <label class="qb-check">
          <input v-model="hasRecommendations" type="checkbox" />
          <span>Asignar recomendaciones según los resultados</span>
        </label>
        <p class="qb-muted">
          Se aplicarán las reglas de recomendaciones que coincidan con la
          calificación. Si no hay coincidencias, el resultado se guardará sin
          asignar una recomendación.
        </p>
      </section>
      <p class="qb-status" role="status" aria-live="polite">{{ message }}</p>
    </fieldset>

    <v-dialog
      v-model="previewOpen"
      max-width="760"
      scrollable
      aria-labelledby="qb-preview-title"
    >
      <div class="quiz-builder qb-preview-dialog">
        <header class="qb-row">
          <div>
            <p class="qb-eyebrow">Vista previa · Sin envío</p>
            <h2 id="qb-preview-title">{{ title || 'Nuevo cuestionario' }}</h2>
          </div>
          <button
            type="button"
            class="qb-icon"
            aria-label="Cerrar vista previa"
            @click="previewOpen = false"
          >
            <v-icon icon="mdi-close" />
          </button>
        </header>
        <div class="qb-preview-content">
          <p v-if="description" class="qb-muted">{{ description }}</p>
          <BuilderQuestionPreview
            v-for="(question, index) in questions"
            :key="question.id"
            :question="question"
            :number="index + 1"
          />
        </div>
        <footer class="qb-row">
          <p class="qb-muted">
            Esta vista es una prueba. Tus respuestas no se guardan.
          </p>
          <button
            type="button"
            class="qb-button qb-button--primary"
            @click="previewOpen = false"
          >
            Volver al constructor
          </button>
        </footer>
      </div>
    </v-dialog>
  </div>
</template>

<style src="./quiz-builder.css" />
