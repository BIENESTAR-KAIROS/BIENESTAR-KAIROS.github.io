<script setup lang="ts">
import type { AdminUserDetail } from '~/interfaces/user/admin-user.interface'
import type { RegistrationInstitute } from '~/interfaces/institution/registration-institute.interface'
import { getApiErrorMessage } from '~/utils/helpers/http-errors'
import {
  userName,
  institutionLabels,
  genderLabel,
  dateLabel,
} from './user-labels'
const { $axios } = useNuxtApp()
const route = useRoute()
const detail = ref<AdminUserDetail | null>(null)
const institutions = ref<RegistrationInstitute[]>([])
const loading = ref(true)
const error = ref('')
const page = ref(1)
let request = 0
async function load() {
  const current = ++request
  loading.value = true
  error.value = ''
  try {
    const [user, directory] = await Promise.all([
      $axios.get<AdminUserDetail>(`/admin/users/${route.params.id}`, {
        params: { page: page.value, limit: 10 },
      }),
      $axios.get<RegistrationInstitute[]>('/institute/registration-directory'),
    ])
    if (current === request) {
      detail.value = user.data
      institutions.value = directory.data
    }
  } catch (cause) {
    if (current === request)
      error.value = getApiErrorMessage(
        cause,
        'No pudimos cargar este perfil. Vuelve a intentarlo.',
      )
  } finally {
    if (current === request) loading.value = false
  }
}
function changePage(next: number) {
  page.value = next
  load()
}
const user = computed(() => detail.value?.user)
const pages = computed(() =>
  Math.max(1, Math.ceil((detail.value?.history.total || 0) / 10)),
)
const score = (value: number | null | undefined) =>
  value == null
    ? 'Sin puntaje'
    : value.toLocaleString('es-MX', { maximumFractionDigits: 2 })
watch(
  () => route.params.id,
  () => {
    page.value = 1
    load()
  },
)
onMounted(load)
onBeforeUnmount(() => {
  request++
})
</script>
<template>
  <main class="admin-users" :aria-busy="loading">
    <NuxtLink class="user-secondary" to="/admin/users"
      >Volver a usuarios</NuxtLink
    >
    <h1>Perfil de usuario</h1>
    <p v-if="loading" role="status">Cargando perfil e historial…</p>
    <div v-else-if="error" role="alert" class="user-error">
      {{ error }} <button @click="load">Volver a intentar</button>
    </div>
    <template v-else-if="user && detail">
      <section class="user-panel">
        <h2>
          {{ userName(user) }}
          <span v-if="user.isDemo" class="user-badge"
            >Demo · datos de ejemplo</span
          >
        </h2>
        <p>{{ user.email }}</p>
        <dl class="user-profile">
          <div>
            <dt>Instituciones</dt>
            <dd>{{ institutionLabels(user, institutions) }}</dd>
          </div>
          <div>
            <dt>Edad</dt>
            <dd>{{ user.studentData?.age ?? 'Sin registro' }}</dd>
          </div>
          <div>
            <dt>Género</dt>
            <dd>{{ genderLabel(user.studentData?.gender) }}</dd>
          </div>
          <div>
            <dt>Campus</dt>
            <dd>
              {{ user.studentData?.campusInformation?.name || 'Sin registro' }}
            </dd>
          </div>
          <div>
            <dt>Carrera</dt>
            <dd>
              {{
                user.studentData?.campusInformation?.career || 'Sin registro'
              }}
            </dd>
          </div>
          <div>
            <dt>Correo</dt>
            <dd>{{ user.isVerificated ? 'Verificado' : 'Sin verificar' }}</dd>
          </div>
          <div>
            <dt>Cuenta</dt>
            <dd>{{ user.active ? 'Activa' : 'Inactiva' }}</dd>
          </div>
          <div>
            <dt>Registro</dt>
            <dd>{{ dateLabel(user.registrationDate) }}</dd>
          </div>
          <div>
            <dt>Último acceso</dt>
            <dd>{{ dateLabel(user.lastAccess) }}</dd>
          </div>
        </dl>
      </section>
      <section class="user-panel">
        <h2>Cuestionarios contestados y resultados</h2>
        <p>{{ detail.history.total }} registros en el historial.</p>
        <p v-if="!detail.history.total">
          Este usuario todavía no tiene cuestionarios contestados.
        </p>
        <article
          v-for="item in detail.history.data"
          :key="item._id"
          class="user-history"
        >
          <h3>{{ item.questionnaireTitle }}</h3>
          <p>{{ dateLabel(item.createdAt) }}</p>
          <p v-if="!item.hasResult">
            Respuesta conservada sin resultado calculado.
          </p>
          <template v-else>
            <p v-if="item.evaluation?.overall || !item.evaluation">
              Puntaje general:
              <strong>{{
                score(item.evaluation?.overall?.score ?? item.score)
              }}</strong
              ><span v-if="item.evaluation?.overall?.interpretation">
                · {{ item.evaluation.overall.interpretation }}</span
              >
            </p>
            <ul
              v-if="item.evaluation?.dimensions.length"
              class="user-dimensions"
            >
              <li v-for="d in item.evaluation.dimensions" :key="d.dimensionId">
                <strong>{{ d.label }}: {{ score(d.score) }}</strong>
                <p>{{ d.interpretation || 'Sin interpretación disponible' }}</p>
                <p v-if="d.recommendations">{{ d.recommendations }}</p>
              </li>
            </ul>
            <p v-for="d in item.subscales || []" :key="d.key">
              {{ d.key }}: {{ score(d.average) }}
            </p>
          </template>
        </article>
        <nav
          v-if="detail.history.total"
          class="user-pagination"
          aria-label="Paginación del historial"
        >
          <button
            class="user-secondary"
            :disabled="page <= 1"
            @click="changePage(page - 1)"
          >
            Anterior</button
          ><span>Página {{ page }} de {{ pages }}</span
          ><button
            class="user-secondary"
            :disabled="page >= pages"
            @click="changePage(page + 1)"
          >
            Siguiente
          </button>
        </nav>
      </section>
    </template>
  </main>
</template>
<style src="./users.css"></style>
