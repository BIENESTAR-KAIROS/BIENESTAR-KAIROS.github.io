<script setup lang="ts">
import axios from 'axios'
import DefinitionQuestion from '~/components/user/quiz/definition-question.vue'
import type { SociodemographicProfile } from '~/interfaces/user/sociodemographic-profile.interface'
import type {
  StudentAnswer,
  StudentAnswers,
  StudentDefinitionQuestion,
} from '~/interfaces/quizzes/student-questionnaire.interface'
import {
  retainVisibleStudentAnswers,
  studentAnswerError,
  visibleStudentQuestions,
} from '~/utils/helpers/student-questionnaire'
import { useAuthStore } from '~/store/auth'

const endpoint = '/questionnaire-answer/me/sociodemographic'
const { $axios } = useNuxtApp()
const auth = useAuthStore()
const profile = ref<SociodemographicProfile | null>(null)
const saved = ref<StudentAnswers>({})
const draft = ref<StudentAnswers>({})
const group = ref('')
const loading = ref(false)
const saving = ref(false)
const unavailable = ref(false)
const conflict = ref(false)
const attempted = ref(false)
const message = ref('')
const error = ref('')
const fields = ref<HTMLElement>()
const questions = computed(() => profile.value?.definition.questions ?? [])
const visible = computed(() =>
  visibleStudentQuestions(questions.value, draft.value),
)
const categories = computed(() => {
  const map = new Map<string, string>()
  // A follow-up without its own heading belongs with the question that opens it.
  for (const q of questions.value) map.set(q._id, q.category?.trim() || '')
  for (const q of questions.value) {
    if (!map.get(q._id))
      map.set(q._id, map.get(q.visibleWhen?.questionId ?? '') || 'Otros datos')
  }
  return map
})
const groups = computed(() => [
  ...new Set(visible.value.map((q) => categories.value.get(q._id)!)),
])
const inSection = computed(() =>
  visible.value.filter((q) => categories.value.get(q._id) === group.value),
)
const dirty = computed(
  () => JSON.stringify(draft.value) !== JSON.stringify(saved.value),
)

function resetForm(data: SociodemographicProfile) {
  profile.value = data
  saved.value = retainVisibleStudentAnswers(
    data.definition.questions,
    Object.fromEntries(
      (data.answer?.responses ?? []).map((row) => [
        row.questionId,
        row.response,
      ]),
    ),
  )
  draft.value = { ...saved.value }
  if (!groups.value.includes(group.value)) group.value = groups.value[0] ?? ''
  attempted.value = false
  conflict.value = false
}

async function load() {
  if (auth.isStudentPreview) return
  loading.value = true
  error.value = ''
  message.value = ''
  unavailable.value = false
  try {
    resetForm((await $axios.get<SociodemographicProfile>(endpoint)).data)
  } catch (cause) {
    const status = axios.isAxiosError(cause)
      ? cause.response?.status
      : undefined
    unavailable.value = status === 403 || status === 404
    error.value = unavailable.value
      ? 'El formulario sociodemográfico no está disponible para tu cuenta.'
      : 'No pudimos cargar tus datos.'
  } finally {
    loading.value = false
  }
}
onMounted(load)

function edit(id: string, value: StudentAnswer) {
  draft.value = retainVisibleStudentAnswers(questions.value, {
    ...draft.value,
    [id]: value,
  })
  message.value = ''
  error.value = ''
}
function cancel() {
  draft.value = { ...saved.value }
  attempted.value = false
  error.value = ''
  if (!groups.value.includes(group.value)) group.value = groups.value[0] ?? ''
  message.value = 'Cambios descartados.'
}
async function focusQuestion(q: StudentDefinitionQuestion) {
  group.value = categories.value.get(q._id)!
  await nextTick()
  fields.value
    ?.querySelector<HTMLElement>(
      `[data-question="${q._id}"] :is(input,select,textarea)`,
    )
    ?.focus()
}
async function save() {
  const current = profile.value
  if (!dirty.value || saving.value || conflict.value || !current?.answer) return
  attempted.value = true
  const invalid = visible.value.find((q) =>
    studentAnswerError(q, draft.value[q._id]),
  )
  if (invalid) {
    await focusQuestion(invalid)
    return
  }
  saving.value = true
  error.value = ''
  try {
    const { data } = await $axios.patch<SociodemographicProfile>(endpoint, {
      answerId: current.answer.id,
      version: current.answer.version,
      definitionRevision: current.definition.revision,
      responses: Object.entries(draft.value).map(([questionId, response]) => ({
        questionId,
        response,
      })),
    })
    resetForm(data)
    message.value = 'Tus cambios se guardaron.'
  } catch (cause) {
    conflict.value = axios.isAxiosError(cause) && cause.response?.status === 409
    error.value = conflict.value
      ? 'Hay una versión más reciente. Recarga el formulario para revisarla.'
      : 'No pudimos guardar tus cambios. Vuelve a intentarlo.'
  } finally {
    saving.value = false
  }
}
</script>
<template>
  <main class="edit-profile">
    <nav aria-label="Ruta de navegación">
      <NuxtLink to="/user/profile">Mi perfil</NuxtLink> / Editar mis datos
    </nav>
    <h1>Editar mis datos</h1>
    <article>
      <header>
        <span class="icon" aria-hidden="true"
          ><v-icon icon="mdi-clipboard-text-outline"
        /></span>
        <div>
          <h2>Datos sociodemográficos</h2>
          <p v-if="profile">
            {{
              [profile.definition.title, auth.activeInstitute?.name]
                .filter(Boolean)
                .join(' · ')
            }}
          </p>
        </div>
      </header>
      <p v-if="auth.isStudentPreview" class="notice">
        Las respuestas personales solo están disponibles en la cuenta del
        alumno.
      </p>
      <p v-else-if="loading" class="notice" role="status">
        Cargando tus datos…
      </p>
      <div v-else-if="!profile || unavailable" class="notice">
        <p role="status">{{ error }}</p>
        <button v-if="!unavailable" type="button" @click="load">
          Volver a intentar
        </button>
      </div>
      <div v-else-if="!profile.answer" class="notice">
        <p>
          Aún no has respondido este cuestionario. Cuando lo completes podrás
          editar tus respuestas aquí.
        </p>
        <NuxtLink :to="`/user/quiz/${profile.definition._id}`"
          >Responder el cuestionario</NuxtLink
        >
      </div>
      <form v-else novalidate @submit.prevent="save">
        <fieldset class="editor" :disabled="saving || conflict">
          <legend class="sr-only">Editar respuestas</legend>
          <label for="profile-section">Sección del formulario</label>
          <select id="profile-section" v-model="group">
            <option v-for="name in groups" :key="name">{{ name }}</option>
          </select>
          <div ref="fields" class="fields">
            <DefinitionQuestion
              v-for="q in inSection"
              :key="q._id"
              :data-question="q._id"
              :class="{
                wide: q.text.length > 60 || q.type === 'multiple_choice',
              }"
              :question="q"
              :answer="draft[q._id]"
              :error="attempted ? studentAnswerError(q, draft[q._id]) : null"
              profile-form
              @answer="edit(q._id, $event)"
            />
          </div>
        </fieldset>
        <div v-if="error" class="error" role="alert">
          {{ error }}
          <button v-if="conflict" type="button" @click="load">
            Recargar formulario
          </button>
        </div>
        <footer>
          <span role="status">{{
            saving
              ? 'Guardando…'
              : dirty
                ? 'Tienes cambios sin guardar'
                : message || 'Todos los cambios guardados'
          }}</span>
          <div class="actions">
            <button
              type="button"
              :disabled="saving || !dirty || conflict"
              @click="cancel"
            >
              Cancelar
            </button>
            <button
              class="primary"
              type="submit"
              :disabled="saving || !dirty || conflict"
            >
              Guardar cambios
            </button>
          </div>
        </footer>
      </form>
    </article>
  </main>
</template>
<style scoped>
.edit-profile {
  background: #f4f8f9;
  color: #0e2a36;
  font-family: 'Figtree', sans-serif;
  padding: 24px 36px 48px;
  min-height: 100vh;
}
nav,
header p,
footer span {
  color: #4b626b;
  font-size: 14px;
}
a {
  color: #065c5d;
  font-weight: 700;
}
h1 {
  margin: 6px 0 18px;
  font-size: 28px;
  letter-spacing: -0.02em;
}
h1,
h2 {
  font-weight: 800;
  line-height: 1.25;
}
article {
  max-width: 1000px;
  background: white;
  border: 1px solid #e2ecee;
  border-radius: 24px;
  box-shadow: 0 7px 22px -17px rgb(6 92 93 / 45%);
}
header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 24px 26px 18px;
}
.icon {
  flex: none;
  display: grid;
  place-items: center;
  background: #dbf2f4;
  color: #065c5d;
  border-radius: 14px;
  height: 44px;
  width: 44px;
}
h2 {
  font-size: 21px;
}
header p {
  margin-top: 5px;
}
.editor,
.notice {
  min-width: 0;
  margin: 0 26px;
  border: 0;
  border-top: 1px solid #dce7e9;
  padding: 18px 0;
}
.notice a,
.notice button {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin-top: 8px;
}
.editor > label {
  display: block;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 6px;
}
.editor > select {
  width: 100%;
  padding: 0 18px;
  height: 52px;
  border: 1.5px solid #82999f;
  border-radius: 26px;
  font: inherit;
  font-weight: 700;
  background: #f2f9f9;
  color: #065c5d;
  appearance: auto;
}
.fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin: 22px 0 6px;
}
.wide {
  grid-column: 1/-1;
}
fieldset:disabled {
  opacity: 0.75;
}
footer {
  padding: 16px 26px;
  border-top: 1px solid #dce7e9;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
button {
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid #82999f;
  color: #065c5d;
  font: inherit;
  font-weight: 700;
}
.primary {
  color: white;
  background: #065c5d;
  border-color: #065c5d;
}
button:disabled {
  background: #dbe6e8;
  border-color: #dbe6e8;
  color: #415961;
  cursor: not-allowed;
}
:is(select, button, a):focus-visible {
  outline: 3px solid #07979f;
  outline-offset: 3px;
}
.error {
  margin: 0 26px 16px;
  color: #8a1c1c;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
@media (max-width: 850px) {
  .fields {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 720px) {
  .edit-profile {
    padding: 20px 18px 40px;
  }
  h1 {
    font-size: 23px;
  }
  article {
    border-radius: 20px;
  }
  header,
  footer {
    padding: 16px;
  }
  .notice,
  .editor,
  .error {
    margin-inline: 16px;
  }
  footer {
    align-items: stretch;
    flex-direction: column;
  }
  .primary {
    flex: 1;
  }
}
</style>
