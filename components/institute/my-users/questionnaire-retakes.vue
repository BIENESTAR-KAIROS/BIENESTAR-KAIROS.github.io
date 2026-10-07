<script setup lang="ts">
import type {
  QuestionnaireRetakesResponse,
  ReleaseQuestionnaireRetakesRequest,
} from '~/interfaces/quizzes/questionnaire-retakes.interface'
import { getApiErrorMessage } from '~/utils/helpers/http-errors'

const props = defineProps<{ studentId: string }>()
const { $axios } = useNuxtApp()
const panelId = useId()
const expanded = ref(false)
const loading = ref(false)
const saving = ref(false)
const failed = ref(false)
const error = ref('')
const success = ref('')
const data = ref<QuestionnaireRetakesResponse | null>(null)
const selected = ref<string[]>([])
const reason = ref('')
const pendingCount = computed(
  () =>
    data.value?.questionnaires.filter(
      (q) => q.latestAttempt?.status === 'pending',
    ).length ?? 0,
)

async function load() {
  loading.value = true
  failed.value = false
  error.value = ''
  try {
    const response = await $axios.get<QuestionnaireRetakesResponse>(
      `/questionnaire/students/${props.studentId}/retakes`,
    )
    data.value = response.data
    selected.value = selected.value.filter((id) =>
      response.data.questionnaires.some(
        (q) => q.questionnaireId === id && q.canRelease,
      ),
    )
  } catch (cause) {
    failed.value = true
    error.value = getApiErrorMessage(
      cause,
      'No pudimos consultar las nuevas aplicaciones.',
    )
  } finally {
    loading.value = false
  }
}
watch(
  () => props.studentId,
  () => {
    selected.value = []
    reason.value = ''
    success.value = ''
    data.value = null
    void load()
  },
  { immediate: true },
)

async function release() {
  if (saving.value || loading.value || !selected.value.length || failed.value)
    return
  saving.value = true
  error.value = ''
  success.value = ''
  const payload: ReleaseQuestionnaireRetakesRequest = {
    questionnaireIds: [...selected.value],
    reason: reason.value.trim() || undefined,
  }
  try {
    const { data: result } = await $axios.post<{ releasedCount: number }>(
      `/questionnaire/students/${props.studentId}/retakes`,
      payload,
    )
    selected.value = []
    reason.value = ''
    success.value =
      result.releasedCount === 1
        ? 'Se habilitó una nueva aplicación. El historial anterior se conserva.'
        : `Se habilitaron ${result.releasedCount} nuevas aplicaciones. El historial anterior se conserva.`
    await load()
  } catch (cause) {
    const message = getApiErrorMessage(
      cause,
      'No pudimos habilitar las nuevas respuestas.',
    )
    // A duplicate or an uncertain response requires fresh state before another submission.
    await load()
    error.value = message
  } finally {
    saving.value = false
  }
}
function date(value: string) {
  return new Date(value).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>

<template>
  <div class="retakes">
    <div class="retakes__header">
      <h3>Nuevas aplicaciones</h3>
      <button
        type="button"
        :aria-expanded="expanded"
        :aria-controls="panelId"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Ocultar opciones' : 'Habilitar nueva respuesta' }}
      </button>
    </div>
    <p v-if="pendingCount" class="retakes__pending">
      {{ pendingCount }}
      {{
        pendingCount === 1 ? 'aplicación pendiente' : 'aplicaciones pendientes'
      }}.
    </p>
    <p v-if="success" class="retakes__success" role="status">{{ success }}</p>
    <div v-show="expanded" :id="panelId">
      <p class="retakes__intro">
        Selecciona los cuestionarios que este estudiante podrá responder de
        nuevo. Cada habilitación permite un envío y conserva sus respuestas y
        resultados anteriores.
      </p>
      <p v-if="loading" role="status">Cargando cuestionarios…</p>
      <div v-if="error" class="retakes__error" role="alert">
        <p>{{ error }}</p>
        <button v-if="failed" type="button" :disabled="loading" @click="load">
          Volver a intentar
        </button>
      </div>
      <template v-if="data && !failed">
        <p v-if="!data.questionnaires.length">
          No hay cuestionarios respondidos disponibles para habilitar de nuevo.
        </p>
        <form v-else @submit.prevent="release">
          <p v-if="data.sequenceActive" class="retakes__intro">
            Las nuevas aplicaciones respetarán el orden de la secuencia activa.
            Los demás cuestionarios seguirán completados.
          </p>
          <fieldset :disabled="saving || loading">
            <legend>Cuestionarios</legend>
            <div
              v-for="quiz in data.questionnaires"
              :key="quiz.questionnaireId"
              class="retakes__option"
            >
              <label>
                <input
                  v-model="selected"
                  type="checkbox"
                  :value="quiz.questionnaireId"
                  :disabled="!quiz.canRelease"
                  :aria-describedby="`${panelId}-${quiz.questionnaireId}`"
                />
                <span>{{ quiz.title }}</span>
              </label>
              <div
                :id="`${panelId}-${quiz.questionnaireId}`"
                class="retakes__details"
              >
                <p v-if="quiz.unavailableReason">
                  {{ quiz.unavailableReason }}
                </p>
                <template v-if="quiz.latestAttempt">
                  <p>
                    Última habilitación:
                    {{ date(quiz.latestAttempt.releasedAt) }} ·
                    {{ quiz.latestAttempt.releasedByName }}.
                  </p>
                  <p v-if="quiz.latestAttempt.reason">
                    Motivo: {{ quiz.latestAttempt.reason }}
                  </p>
                  <p v-if="quiz.latestAttempt.completedAt">
                    Respondida: {{ date(quiz.latestAttempt.completedAt) }}.
                  </p>
                </template>
              </div>
            </div>
            <label class="retakes__reason" :for="`${panelId}-reason`">
              Motivo (opcional)
            </label>
            <textarea
              :id="`${panelId}-reason`"
              v-model="reason"
              rows="3"
              maxlength="500"
            />
            <p class="retakes__details">{{ reason.length }} / 500 caracteres</p>
            <button
              type="submit"
              class="retakes__submit"
              :disabled="!selected.length"
            >
              {{
                saving
                  ? 'Habilitando…'
                  : `Habilitar nueva respuesta (${selected.length})`
              }}
            </button>
          </fieldset>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped>
.retakes {
  border-top: 1px solid #efebf5;
  padding: 24px;
  color: #3c2f52;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  line-height: 1.6;
}
.retakes__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
h3 {
  font-size: 18px;
  font-weight: 800;
}
button {
  min-height: 44px;
  border: 2px solid #ded6ea;
  border-radius: 999px;
  padding: 8px 18px;
  color: #3c2f52;
  background: #fff;
  font: inherit;
  font-weight: 700;
}
button:disabled,
input:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.retakes__submit {
  background: #3c2f52;
  border-color: #3c2f52;
  color: #fff;
  margin-top: 16px;
}
button:hover:not(:disabled) {
  border-color: #3c2f52;
}
.retakes__submit:hover:not(:disabled) {
  background: #523f6e;
}
:is(button, input, textarea):focus-visible {
  outline: 3px solid #5c4a75;
  outline-offset: 3px;
}
.retakes__intro {
  margin: 16px 0;
  color: #4b3f60;
}
fieldset {
  min-width: 0;
  border: 0;
}
legend,
.retakes__reason {
  font-weight: 700;
  margin-bottom: 8px;
}
.retakes__option {
  border: 1px solid #efebf5;
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 12px;
  overflow-wrap: anywhere;
}
.retakes__option label {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
}
input {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  accent-color: #3c2f52;
}
.retakes__details {
  color: #6b6080;
  font-size: 13px;
}
.retakes__reason {
  display: block;
  margin-top: 20px;
}
textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #ded6ea;
  border-radius: 16px;
  background: #faf9fc;
  font: inherit;
  resize: vertical;
}
.retakes__pending,
.retakes__success,
.retakes__error {
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: 16px;
}
.retakes__pending {
  background: #f0eaf5;
  color: #5c4a75;
}
.retakes__success {
  background: #edf6f3;
  color: #2c6a5c;
}
.retakes__error {
  background: #fdf3f3;
  color: #8a3d3d;
  margin-bottom: 16px;
}
@media (max-width: 700px) {
  .retakes {
    padding: 20px 16px;
  }
  .retakes__header button,
  .retakes__submit {
    width: 100%;
  }
}
</style>
