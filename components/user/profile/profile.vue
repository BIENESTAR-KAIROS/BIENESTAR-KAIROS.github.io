<script setup lang="ts">
import type { QuestionnaireAnswerByUserResponseDto } from '~/dto/response/questionnaire-answer/questionniare-answer-by-user.response.dto'
import { useAuthStore } from '~/store/auth'

const authStore = useAuthStore()
const { $axios } = useNuxtApp()

const roleLabels: Record<string, string> = {
  KAIROS_ADMIN: 'Administrador KAIROS',
  INSTITUTION_ADMIN: 'Administrador institucional',
  INSTITUTION_STAFF: 'Equipo institucional',
  STUDENT: 'Alumna/o',
}

const user = computed(() => authStore.user)

const questionnaireAnswers = ref<QuestionnaireAnswerByUserResponseDto[]>([])
const isLoadingHistory = ref(false)

const demographicSurveyCompleted = computed(() => {
  return user.value?.studentData?.demographicSurveyCompleted || false
})

const fullName = computed(() => {
  return [user.value?.name, user.value?.lastName, user.value?.surName]
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .trim()
})

const displayName = computed(() => fullName.value || 'Tu perfil KAIROS')

const initials = computed(() => {
  const firstName = user.value?.name?.trim().charAt(0) || ''
  const lastName = user.value?.lastName?.trim().charAt(0) || ''

  return `${firstName}${lastName}`.toUpperCase() || 'K'
})

const roleLabel = computed(() => {
  const [firstRole] = user.value?.roles || []

  return firstRole
    ? roleLabels[firstRole] || formatLabel(firstRole)
    : 'Alumna/o'
})

const campusName = computed(() => {
  return (
    user.value?.studentData?.campusInformation?.name ||
    user.value?.institute?.name ||
    'Campus pendiente'
  )
})

const joinDateLabel = computed(() => formatDate(user.value?.createdAt))

const surveyBadgeLabel = computed(() =>
  demographicSurveyCompleted.value
    ? 'Cuestionario sociodemográfico completo'
    : 'Cuestionario sociodemográfico pendiente',
)

function formatLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

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
  if (!user.value?._id) return

  try {
    isLoadingHistory.value = true

    const response = await $axios.get<QuestionnaireAnswerByUserResponseDto[]>(
      `/questionnaire-answer/user/${user.value._id}/all/`,
    )

    questionnaireAnswers.value = response.data
  } catch (error) {
    console.log(error)
  } finally {
    isLoadingHistory.value = false
  }
}

onMounted(() => {
  fetchQuestionnaireHistory()
})
</script>

<template>
  <div class="profile">
    <header class="profile__header">
      <span class="profile__avatar">{{ initials }}</span>

      <div class="profile__info">
        <span class="profile__name">{{ displayName }}</span>
        <span class="profile__meta">
          {{ user?.email || 'Sin correo registrado' }} · {{ campusName }} · Alta
          el {{ joinDateLabel }}
        </span>

        <div class="profile__badges">
          <span class="profile__badge profile__badge--role">{{
            roleLabel
          }}</span>
          <span
            class="profile__badge"
            :class="
              demographicSurveyCompleted
                ? 'profile__badge--survey-done'
                : 'profile__badge--survey-pending'
            "
          >
            {{ surveyBadgeLabel }}
          </span>
        </div>
      </div>

      <NuxtLink to="/user/update-my-data" class="profile__edit-button">
        Editar mis datos
      </NuxtLink>
    </header>

    <div class="profile__body">
      <article class="profile__history">
        <div class="profile__history-header">
          <span class="profile__history-title"
            >Mi historial de cuestionarios</span
          >
          <span class="profile__history-count">
            {{ questionnaireAnswers.length }}
            {{ questionnaireAnswers.length === 1 ? 'respuesta' : 'respuestas' }}
          </span>
        </div>

        <p v-if="isLoadingHistory" class="profile__history-empty">
          Cargando tu historial…
        </p>

        <p
          v-else-if="questionnaireAnswers.length === 0"
          class="profile__history-empty"
        >
          Aún no has llenado ningún cuestionario.
        </p>

        <table v-else class="profile__table">
          <thead>
            <tr>
              <th>Cuestionario</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="answer in questionnaireAnswers" :key="answer.id">
              <td class="profile__table-title">
                {{ answer.questionnaireId?.title || 'Cuestionario' }}
              </td>
              <td class="profile__table-date">
                {{ formatDate(answer.submittedAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </article>

      <aside class="profile__sidebar">
        <article class="profile__privacy-card">
          <span class="profile__privacy-title">Tu privacidad</span>
          <p class="profile__privacy-text">
            Tu institución ve tendencias agregadas y solo abre tu historial
            clínico si tú lo autorizas o si detectamos un riesgo.
          </p>
          <NuxtLink to="/user/privacy-policy" class="profile__privacy-link">
            Leer el aviso completo →
          </NuxtLink>
        </article>

        <article class="profile__support-card">
          <span class="profile__support-title">Recuerda</span>
          <p class="profile__support-text">
            Tu institución pone a tu disposición especialistas y recursos de
            apoyo para cualquier cosa que necesites.
          </p>
          <NuxtLink to="/user/get-help" class="profile__support-button">
            Contactar ahora
          </NuxtLink>
        </article>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.profile {
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
  background: #f4f8f9;
  min-height: 100vh;
  padding: 24px 36px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile__header {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  box-shadow: 0 6px 20px -12px rgba(6, 92, 93, 0.35);
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.profile__avatar {
  flex-shrink: 0;
  width: 88px;
  height: 88px;
  border-radius: 999px;
  background: #8475a0;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 800;
}

.profile__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile__name {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.profile__meta {
  font-size: 15px;
  color: #5c7078;
}

.profile__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.profile__badge {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.profile__badge--role {
  background: #dbf2f4;
  color: #065c5d;
}

.profile__badge--survey-done {
  background: #f0eaf5;
  color: #5c4a75;
}

.profile__badge--survey-pending {
  background: #fdf1e3;
  color: #8a5a1f;
}

.profile__edit-button {
  flex-shrink: 0;
  height: 46px;
  padding: 0 22px;
  border-radius: 999px;
  border: 2px solid #cfdde1;
  background: #fff;
  font-family: 'Figtree', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #0e2a36;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    border-color 0.15s ease,
    color 0.15s ease;
}

.profile__edit-button:hover {
  border-color: #07979f;
  color: #07979f;
}

.profile__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  align-items: start;
}

.profile__history {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  box-shadow: 0 6px 20px -12px rgba(6, 92, 93, 0.35);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.profile__history-header {
  padding: 22px 24px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.profile__history-title {
  font-size: 19px;
  font-weight: 800;
}

.profile__history-count {
  font-size: 13px;
  color: #5f767e;
  white-space: nowrap;
}

.profile__history-empty {
  margin: 0;
  padding: 8px 24px 28px;
  color: #5c7078;
  line-height: 1.7;
}

.profile__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.profile__table thead tr {
  height: 44px;
  background: #f7fafb;
  color: #5f767e;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.profile__table th {
  text-align: left;
  padding: 0 24px;
  font-weight: 700;
}

.profile__table tbody tr {
  height: 56px;
  border-top: 1px solid #f0f5f6;
}

.profile__table td {
  padding: 0 24px;
}

.profile__table-title {
  font-weight: 600;
}

.profile__table-date {
  color: #5c7078;
}

.profile__sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile__privacy-card,
.profile__support-card {
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.profile__privacy-card {
  background: #065c5d;
  color: #fff;
}

.profile__privacy-title,
.profile__support-title {
  font-size: 17px;
  font-weight: 800;
}

.profile__privacy-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #c7e9ea;
}

.profile__privacy-link {
  font-size: 14px;
  font-weight: 700;
  color: #6cc5cb;
  text-decoration: none;
}

.profile__privacy-link:hover {
  color: #dbf2f4;
}

.profile__support-card {
  background: #fff;
  border: 1px solid #eaf1f2;
  box-shadow: 0 6px 20px -12px rgba(6, 92, 93, 0.35);
}

.profile__support-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #5c7078;
}

.profile__support-button {
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

.profile__support-button:hover {
  background: #6cc5cb;
  color: #fff;
}

@media (max-width: 1180px) {
  .profile__body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .profile {
    padding: 20px 18px 40px;
  }

  .profile__header {
    flex-wrap: wrap;
  }

  .profile__edit-button {
    width: 100%;
  }

  .profile__table {
    display: block;
    overflow-x: auto;
  }
}
</style>
