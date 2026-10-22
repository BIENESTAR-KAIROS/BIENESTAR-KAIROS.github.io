<script setup lang="ts">
import type { AdminUsersPage } from '~/interfaces/user/admin-user.interface'
import type { RegistrationInstitute } from '~/interfaces/institution/registration-institute.interface'
import { getApiErrorMessage } from '~/utils/helpers/http-errors'
import { genderLabel, institutionLabels, userName } from './user-labels'
import UserManager from '~/components/global/users/UserManager.vue'
import DemoAssignment from './DemoAssignment.vue'

const { $axios } = useNuxtApp()
const institutions = ref<RegistrationInstitute[]>([])
const campuses = ref<string[]>([])
const result = ref<AdminUsersPage | null>(null)
const loading = ref(true)
const error = ref('')
const optionsError = ref('')
const page = ref(1)
const limit = ref(10)
const filters = reactive({
  search: '',
  institutionId: '',
  gender: '',
  campus: '',
  ageMin: '',
  ageMax: '',
  population: '',
})
let request = 0
async function load() {
  const current = ++request
  loading.value = true
  error.value = ''
  try {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== ''),
    )
    const response = await $axios.get<AdminUsersPage>('/admin/users', {
      params: { ...params, page: page.value, limit: limit.value },
    })
    if (current === request) result.value = response.data
  } catch (cause) {
    if (current === request)
      error.value = getApiErrorMessage(
        cause,
        'No pudimos cargar los usuarios. Vuelve a intentarlo.',
      )
  } finally {
    if (current === request) loading.value = false
  }
}
async function loadOptions() {
  optionsError.value = ''
  try {
    const [directory, options] = await Promise.all([
      $axios.get<RegistrationInstitute[]>('/institute/registration-directory'),
      $axios.get<{ campuses: string[] }>('/admin/users/options'),
    ])
    institutions.value = directory.data
    campuses.value = options.data.campuses
  } catch {
    optionsError.value = 'No pudimos cargar las instituciones y los campus.'
  }
}
function refreshUsers() {
  load()
  loadOptions()
}
function applyFilters() {
  page.value = 1
  load()
}
function resetFilters() {
  Object.assign(filters, {
    search: '',
    institutionId: '',
    gender: '',
    campus: '',
    ageMin: '',
    ageMax: '',
    population: '',
  })
  applyFilters()
}
function changePage(next: number) {
  page.value = next
  load()
}
const pages = computed(() =>
  Math.max(1, Math.ceil((result.value?.total || 0) / limit.value)),
)
onMounted(() => {
  load()
  loadOptions()
})
onBeforeUnmount(() => {
  request++
})
</script>

<template>
  <main class="admin-users">
    <header>
      <h1>Usuarios</h1>
      <p>
        Consulta las cuentas registradas, su información y los cuestionarios que
        han contestado.
      </p>
      <UserManager :institutions="institutions" @changed="refreshUsers" />
    </header>
    <div v-if="result" class="user-counts" aria-label="Totales registrados">
      <div>
        <strong>{{ result.totalRegistered.toLocaleString('es-MX') }}</strong
        ><span>Cuentas registradas</span>
      </div>
      <div>
        <strong>{{ result.totalDemo.toLocaleString('es-MX') }}</strong
        ><span>Cuentas demo</span>
      </div>
      <div>
        <strong>{{
          (result.totalRegistered - result.totalDemo).toLocaleString('es-MX')
        }}</strong
        ><span>Otras cuentas</span>
      </div>
    </div>
    <div v-if="optionsError" role="alert" class="user-error">
      {{ optionsError }}
      <button type="button" @click="loadOptions">Volver a intentar</button>
    </div>
    <DemoAssignment :institutions="institutions" @changed="load" />
    <section
      class="user-panel"
      aria-label="Listado de usuarios"
      :aria-busy="loading"
    >
      <form class="user-filters" @submit.prevent="applyFilters">
        <label
          >Buscar nombre o correo<input
            v-model="filters.search"
            type="search"
            maxlength="100"
        /></label>
        <label
          >Institución<select v-model="filters.institutionId">
            <option value="">Todas</option>
            <option v-for="i in institutions" :key="i._id" :value="i._id">
              {{ i.name }}
            </option>
          </select></label
        >
        <label
          >Tipo de cuenta<select v-model="filters.population">
            <option value="">Todas</option>
            <option value="real">Sin marca demo</option>
            <option value="demo">Demo</option>
          </select></label
        >
        <label
          >Género<select v-model="filters.gender">
            <option value="">Todos</option>
            <option value="female">Femenino</option>
            <option value="male">Masculino</option>
            <option value="other">Otro</option>
          </select></label
        >
        <label
          >Campus<select v-model="filters.campus">
            <option value="">Todos</option>
            <option v-for="campus in campuses" :key="campus" :value="campus">
              {{ campus }}
            </option>
          </select></label
        >
        <label
          >Edad mínima<input
            v-model="filters.ageMin"
            type="number"
            min="0"
            max="120"
        /></label>
        <label
          >Edad máxima<input
            v-model="filters.ageMax"
            type="number"
            :min="filters.ageMin || 0"
            max="120"
        /></label>
        <div class="user-actions">
          <button class="user-primary" type="submit" :disabled="loading">
            Aplicar filtros</button
          ><button class="user-secondary" type="button" @click="resetFilters">
            Limpiar
          </button>
        </div>
      </form>
      <p v-if="loading" role="status">Cargando usuarios…</p>
      <div v-else-if="error" role="alert" class="user-error">
        {{ error }}
        <button type="button" @click="load">Volver a intentar</button>
      </div>
      <template v-else-if="result">
        <p role="status">
          {{ result.total.toLocaleString('es-MX') }} cuentas coinciden con los
          filtros. Cada cuenta se cuenta una sola vez.
        </p>
        <p v-if="!result.data.length">
          No hay usuarios que coincidan con estos filtros.
        </p>
        <div
          v-else
          class="user-table"
          tabindex="0"
          role="region"
          aria-label="Tabla de usuarios, desliza para ver todas las columnas"
        >
          <table>
            <thead>
              <tr>
                <th scope="col">Usuario</th>
                <th scope="col">Institución</th>
                <th scope="col">Edad / género</th>
                <th scope="col">Campus</th>
                <th scope="col">Estado</th>
                <th scope="col">Detalle</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in result.data" :key="u._id">
                <td>
                  <strong>{{ userName(u) }}</strong
                  ><small>{{ u.email }}</small
                  ><span v-if="u.isDemo" class="user-badge">Demo</span>
                </td>
                <td>{{ institutionLabels(u, institutions) }}</td>
                <td>
                  {{ u.studentData?.age ?? '—' }} /
                  {{ genderLabel(u.studentData?.gender) }}
                </td>
                <td>
                  {{ u.studentData?.campusInformation?.name || 'Sin registro' }}
                </td>
                <td>
                  {{ u.isVerificated ? 'Correo verificado' : 'Sin verificar'
                  }}<small>{{
                    u.active ? 'Cuenta activa' : 'Cuenta inactiva'
                  }}</small>
                </td>
                <td>
                  <NuxtLink
                    :to="`/admin/users/${u._id}`"
                    class="user-secondary"
                    :aria-label="`Ver perfil de ${userName(u)}`"
                    >Ver perfil</NuxtLink
                  >
                  <UserManager
                    :user-id="u._id"
                    :institutions="institutions"
                    @changed="refreshUsers"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <nav class="user-pagination" aria-label="Paginación de usuarios">
          <label
            >Por página<select v-model.number="limit" @change="applyFilters">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select></label
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
      </template>
    </section>
  </main>
</template>

<style src="./users.css"></style>
