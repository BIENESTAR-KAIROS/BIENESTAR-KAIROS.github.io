<script setup lang="ts">
import type { QuestionnaireAnswerByUserResponseDto } from '~/dto/response/questionnaire-answer/questionniare-answer-by-user.response.dto'
import { useAuthStore } from '~/store/auth'

const authStore = useAuthStore()
const { $axios } = useNuxtApp()

const questionnaireAnswers = ref<QuestionnaireAnswerByUserResponseDto[]>([])
const isLoading = ref(false)

function formatDate(value?: Date | string | number) {
  if (!value) return 'Sin registro'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Sin registro'
  }

  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

async function fetchQuestionnaireHistory() {
  if (!authStore.user?._id) return

  try {
    isLoading.value = true

    const response = await $axios.get<QuestionnaireAnswerByUserResponseDto[]>(
      `/questionnaire-answer/user/${authStore.user._id}/all/`,
    )

    questionnaireAnswers.value = response.data
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchQuestionnaireHistory()
})
</script>

<template>
  <div class="history">
    <header class="history__header">
      <span class="history__eyebrow">Cuenta</span>
      <h1 class="history__title">Mi historial</h1>
      <p class="history__description">
        Aquí verás las respuestas de los cuestionarios que has llenado una vez
        que tu institución las apruebe.
      </p>
    </header>

    <div class="history__body">
      <article class="history__card">
        <div class="history__card-header">
          <span class="history__card-title">Tus respuestas</span>
          <span class="history__card-count">
            {{ questionnaireAnswers.length }}
            {{ questionnaireAnswers.length === 1 ? 'respuesta' : 'respuestas' }}
          </span>
        </div>

        <p v-if="isLoading" class="history__empty">Cargando tu historial…</p>

        <p v-else-if="questionnaireAnswers.length === 0" class="history__empty">
          Aún no has llenado ningún cuestionario. Ve a la sección
          "Cuestionarios" para responder el siguiente que tengas disponible.
        </p>

        <table v-else class="history__table">
          <thead>
            <tr>
              <th>Cuestionario</th>
              <th>Fecha de respuesta</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="answer in questionnaireAnswers" :key="answer.id">
              <td class="history__table-title">
                {{ answer.questionnaireId?.title || 'Cuestionario' }}
              </td>
              <td class="history__table-date">
                {{ formatDate(answer.submittedAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </article>

      <aside class="history__sidebar">
        <article class="history__reminder-card">
          <span class="history__reminder-title">Para tu bienestar</span>
          <p class="history__reminder-text">
            Mientras esperas, te recomendamos ir a la sección "Queremos
            ayudarte" y tomar alguna de las meditaciones guiadas.
          </p>
          <NuxtLink to="/user/get-help" class="history__reminder-link">
            Ver meditaciones guiadas →
          </NuxtLink>
        </article>

        <article class="history__support-card">
          <span class="history__support-title">Recuerda</span>
          <p class="history__support-text">
            Tu institución pone a tu disposición especialistas y recursos de
            apoyo para cualquier cosa que necesites.
          </p>
          <NuxtLink to="/user/get-help" class="history__support-button">
            Contactar ahora
          </NuxtLink>
        </article>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.history {
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
  background: #f4f8f9;
  min-height: 100vh;
  padding: 24px 36px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.history__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 720px;
}

.history__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5f767e;
}

.history__title {
  margin: 2px 0 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.history__description {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: #5c7078;
}

.history__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  align-items: start;
}

.history__card {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  box-shadow: 0 6px 20px -12px rgba(6, 92, 93, 0.35);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.history__card-header {
  padding: 22px 24px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.history__card-title {
  font-size: 19px;
  font-weight: 800;
}

.history__card-count {
  font-size: 13px;
  color: #5f767e;
  white-space: nowrap;
}

.history__empty {
  margin: 0;
  padding: 8px 24px 28px;
  color: #5c7078;
  line-height: 1.7;
}

.history__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.history__table thead tr {
  height: 44px;
  background: #f7fafb;
  color: #5f767e;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.history__table th {
  text-align: left;
  padding: 0 24px;
  font-weight: 700;
}

.history__table tbody tr {
  height: 56px;
  border-top: 1px solid #f0f5f6;
}

.history__table td {
  padding: 0 24px;
}

.history__table-title {
  font-weight: 600;
}

.history__table-date {
  color: #5c7078;
}

.history__sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history__reminder-card,
.history__support-card {
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history__reminder-card {
  background: #065c5d;
  color: #fff;
}

.history__reminder-title,
.history__support-title {
  font-size: 17px;
  font-weight: 800;
}

.history__reminder-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #c7e9ea;
}

.history__reminder-link {
  font-size: 14px;
  font-weight: 700;
  color: #6cc5cb;
  text-decoration: none;
}

.history__reminder-link:hover {
  color: #dbf2f4;
}

.history__support-card {
  background: #fff;
  border: 1px solid #eaf1f2;
  box-shadow: 0 6px 20px -12px rgba(6, 92, 93, 0.35);
}

.history__support-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #5c7078;
}

.history__support-button {
  height: 44px;
  border-radius: 999px;
  border: 0;
  background: #dbf2f4;
  color: #065c5d;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.history__support-button:hover {
  background: #6cc5cb;
  color: #fff;
}

@media (max-width: 1180px) {
  .history__body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .history {
    padding: 20px 18px 40px;
  }

  .history__table {
    display: block;
    overflow-x: auto;
  }
}
</style>
