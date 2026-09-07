<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { roleLabels } from '~/utils/translations'
import type {
  IUserSummary,
  IPaginatedUsers,
  IUserListFacets,
} from '~/interfaces/user/paginated-users.interface'

const { $axios, $router } = useNuxtApp()
const authStore = useAuthStore()

const instituteId = authStore.user?.institute?._id || authStore.user?.institute

const isLoadingUsers = ref(false)
const usersError = ref('')

const users = ref<IUserSummary[]>([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const totalPages = ref(0)
const searchText = ref('')
const facets = ref<IUserListFacets | null>(null)

/** Umbral de atención; coincide con WELLBEING_ATTENTION_THRESHOLD del backend. */
const ATTENTION_THRESHOLD = 2.5
const MAX_SCORE = 5

type FilterKey = 'all' | 'students' | 'staff' | 'inactive' | 'attention'

const activeFilter = ref<FilterKey>('all')

/** Cada chip se traduce a los params `role` / `status` del endpoint. */
const filterParams: Record<FilterKey, { role?: string; status?: string }> = {
  all: {},
  students: { role: 'STUDENT' },
  staff: { role: 'STAFF' },
  inactive: { status: 'INACTIVE' },
  attention: { status: 'ATTENTION' },
}

const chips = computed(() => [
  { key: 'all' as FilterKey, label: 'Todos', count: facets.value?.all },
  {
    key: 'students' as FilterKey,
    label: 'Estudiantes',
    count: facets.value?.students,
  },
  { key: 'staff' as FilterKey, label: 'Staff', count: facets.value?.staff },
  {
    key: 'inactive' as FilterKey,
    label: 'Sin actividad',
    count: facets.value?.inactive,
  },
  {
    key: 'attention' as FilterKey,
    label: 'Requieren atención',
    count: facets.value?.attention,
    warn: true,
  },
])

function selectFilter(key: FilterKey) {
  if (activeFilter.value === key) return
  activeFilter.value = key
  page.value = 1
  fetchUsers()
}

const needsAttention = (user: IUserSummary) =>
  user.wellbeingScore !== null && user.wellbeingScore < ATTENTION_THRESHOLD

const scoreWidth = (score: number) =>
  `${Math.min(100, Math.max(0, Math.round((score / MAX_SCORE) * 100)))}%`

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const formatNumber = (value?: number) =>
  typeof value === 'number' ? value.toLocaleString('es-MX') : '—'

/**
 * El título cuenta la institución completa, no el resultado filtrado: los
 * chips no deben cambiar la frase "N personas en tu institución".
 */
const headerTitle = computed(() => {
  const count = facets.value?.all ?? total.value
  if (!count) return 'Personas en tu institución'
  const people = count === 1 ? 'persona' : 'personas'
  return `${formatNumber(count)} ${people} en tu institución`
})

function getFullName(user: {
  name: string
  lastName: string
  surName?: string
}) {
  return [user.name, user.lastName, user.surName].filter(Boolean).join(' ')
}

function getInitials(user: { name: string; lastName: string }) {
  return [user.name, user.lastName]
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

const isStudent = (user: IUserSummary) => user.roles.includes('STUDENT')

/** El diseño muestra una sola etiqueta por persona, no todos sus roles. */
function roleLabel(user: IUserSummary) {
  const primary = isStudent(user)
    ? 'STUDENT'
    : (user.roles.find((role) => role !== 'STUDENT') ?? '')

  return roleLabels[primary] || primary || 'Sin rol'
}

/**
 * El diseño muestra el último acceso en relativo: "Hoy, 08:12",
 * "Ayer, 17:40", "Hace 21 días".
 */
function formatLastAccess(date?: Date | string) {
  if (!date) return 'Sin registro'

  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return 'Sin registro'

  const time = value.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const startOfDay = (input: Date) =>
    new Date(input.getFullYear(), input.getMonth(), input.getDate()).getTime()

  const days = Math.round(
    (startOfDay(new Date()) - startOfDay(value)) / 86400000,
  )

  if (days === 0) return `Hoy, ${time}`
  if (days === 1) return `Ayer, ${time}`
  if (days < 30) return `Hace ${days} días`

  return value.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function fetchUsers() {
  if (!instituteId) return
  try {
    isLoadingUsers.value = true
    usersError.value = ''

    const params: Record<string, string | number> = {
      page: page.value,
      limit: limit.value,
    }

    const search = searchText.value.trim()
    if (search) params.search = search

    const { role, status } = filterParams[activeFilter.value]
    if (role) params.role = role
    if (status) params.status = status

    const { data } = await $axios.get<IPaginatedUsers>(
      `/user/institute/${instituteId}`,
      { params },
    )

    users.value = data.data
    total.value = data.total
    totalPages.value = data.totalPages
    facets.value = data.facets ?? null
  } catch (error) {
    console.error('Error fetching users', error)
    usersError.value =
      'No pudimos cargar la lista de usuarios. Intenta de nuevo.'
    users.value = []
    total.value = 0
    totalPages.value = 0
  } finally {
    isLoadingUsers.value = false
  }
}

function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchUsers()
  }, 400)
}

function clearSearch() {
  searchText.value = ''
  if (searchTimeout) clearTimeout(searchTimeout)
  page.value = 1
  fetchUsers()
}

function goToPage(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value || newPage === page.value)
    return
  page.value = newPage
  fetchUsers()
}

/**
 * Paginación del diseño: primeras páginas, elipsis y última.
 */
const pageItems = computed<(number | 'gap')[]>(() => {
  const length = totalPages.value
  if (length <= 1) return []
  if (length <= 6) return Array.from({ length }, (_, i) => i + 1)

  const current = page.value
  const items: (number | 'gap')[] = []
  const window = new Set<number>([1, length, current])

  for (let i = current - 1; i <= current + 1; i++) {
    if (i > 1 && i < length) window.add(i)
  }
  if (current <= 3) [2, 3].forEach((i) => window.add(i))
  if (current >= length - 2)
    [length - 1, length - 2].forEach((i) => window.add(i))

  const sorted = [...window]
    .filter((i) => i >= 1 && i <= length)
    .sort((a, b) => a - b)

  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) items.push('gap')
    items.push(value)
  })

  return items
})

const rangeLabel = computed(() => {
  if (!total.value) return 'Sin resultados'
  const from = (page.value - 1) * limit.value + 1
  const to = Math.min(page.value * limit.value, total.value)
  return `Mostrando ${from}–${to} de ${formatNumber(total.value)}`
})

function goToDetail(user: IUserSummary) {
  $router.push(`/institute/my-users/${user._id}`)
}

onMounted(fetchUsers)

onBeforeUnmount(() => {
  if (searchTimeout) clearTimeout(searchTimeout)
})
</script>

<template>
  <div class="users">
    <header class="users__header">
      <div class="users__heading">
        <span class="users__eyebrow">Mis usuarios</span>
        <span class="users__title">{{ headerTitle }}</span>
      </div>

      <div class="users__search">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9b8fb0"
          stroke-width="2.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M20 20l-4.8-4.8" />
        </svg>
        <input
          v-model="searchText"
          class="users__search-input"
          type="search"
          placeholder="Buscar por nombre o correo"
          aria-label="Buscar por nombre o correo"
          @input="onSearchInput"
        />
        <button
          v-if="searchText"
          type="button"
          class="users__search-clear"
          aria-label="Limpiar búsqueda"
          @click="clearSearch"
        >
          ×
        </button>
      </div>
    </header>

    <div class="users__body">
      <div class="chips">
        <button
          v-for="chip in chips"
          :key="chip.key"
          type="button"
          class="chip"
          :class="{
            'chip--active': activeFilter === chip.key,
            'chip--warn': chip.warn && activeFilter !== chip.key,
          }"
          @click="selectFilter(chip.key)"
        >
          {{ chip.label }}
          <template v-if="chip.count !== undefined">
            · {{ formatNumber(chip.count) }}</template
          >
        </button>
      </div>

      <div class="card">
        <p v-if="usersError" class="state state--error">{{ usersError }}</p>

        <p v-else-if="isLoadingUsers" class="state">Cargando usuarios…</p>

        <p v-else-if="!users.length" class="state">
          <template v-if="searchText.trim()">
            No encontramos usuarios que coincidan con «{{ searchText.trim() }}».
          </template>
          <template v-else>Todavía no hay usuarios registrados.</template>
        </p>

        <template v-else>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th class="table__pad-lg">Nombre</th>
                  <th>Rol</th>
                  <th>Bienestar</th>
                  <th>Cuestionarios 6m</th>
                  <th>Último acceso</th>
                  <th class="table__pad-lg table__right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="user in users"
                  :key="user._id"
                  class="row"
                  :class="{ 'row--warn': needsAttention(user) }"
                  tabindex="0"
                  @click="goToDetail(user)"
                  @keydown.enter="goToDetail(user)"
                >
                  <td class="table__pad-lg">
                    <div class="person">
                      <span
                        class="person__avatar"
                        :class="{
                          'person__avatar--warn': needsAttention(user),
                        }"
                      >
                        {{ getInitials(user) }}
                      </span>
                      <span class="person__copy">
                        <span class="person__name">{{
                          getFullName(user)
                        }}</span>
                        <span class="person__email">{{ user.email }}</span>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      class="pill"
                      :class="isStudent(user) ? 'pill--student' : 'pill--staff'"
                    >
                      {{ roleLabel(user) }}
                    </span>
                  </td>
                  <td>
                    <span
                      v-if="user.wellbeingScore !== null"
                      class="score"
                      :class="{ 'score--warn': needsAttention(user) }"
                    >
                      {{ user.wellbeingScore }}
                      <span class="score__track">
                        <span
                          class="score__fill"
                          :style="{ width: scoreWidth(user.wellbeingScore) }"
                        />
                      </span>
                    </span>
                    <span v-else class="table__empty">—</span>
                  </td>
                  <td class="table__count">
                    {{ user.quizCountLastSixMonths }}
                  </td>
                  <td class="table__muted">
                    {{ formatLastAccess(user.lastAccess) }}
                  </td>
                  <td class="table__pad-lg table__right">
                    <a
                      v-if="needsAttention(user)"
                      class="row__contact"
                      :href="`mailto:${user.email}`"
                      @click.stop
                    >
                      Contactar
                    </a>
                    <span v-else class="row__cta">Ver detalle →</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="card__footer">
            <span class="card__range">{{ rangeLabel }}</span>
            <div v-if="totalPages > 1" class="pager">
              <template v-for="(item, index) in pageItems" :key="index">
                <span v-if="item === 'gap'" class="pager__gap">…</span>
                <button
                  v-else
                  type="button"
                  class="pager__page"
                  :class="{ 'pager__page--active': item === page }"
                  @click="goToPage(item)"
                >
                  {{ item }}
                </button>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.users {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f4f8;
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
}

.users__header {
  min-height: 74px;
  padding: 12px 32px;
  background: #fff;
  border-bottom: 1px solid #eae6f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.users__heading {
  display: flex;
  flex-direction: column;
}

.users__eyebrow {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9b8fb0;
}

.users__title {
  font-size: 19px;
  font-weight: 800;
}

.users__search {
  position: relative;
  width: 300px;
  height: 42px;
  border-radius: 999px;
  background: #f5f4f8;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
}

.users__search-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  color: #0e2a36;
  outline: none;
}

.users__search-input::placeholder {
  color: #9b8fb0;
}

.users__search-input::-webkit-search-cancel-button {
  display: none;
}

.users__search-clear {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  border: 0;
  border-radius: 999px;
  background: #e7e2ef;
  color: #6b6080;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
}

.users__body {
  flex: 1;
  padding: 22px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  flex: 1;
  background: #fff;
  border: 1px solid #efebf5;
  border-radius: 22px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.state {
  margin: 0;
  padding: 56px 22px;
  text-align: center;
  font-size: 14px;
  color: #7d7391;
}

.state--error {
  color: #b3261e;
}

.table-wrap {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table thead tr {
  height: 46px;
  background: #faf9fc;
}

.table thead th {
  padding: 0 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8a7ea3;
  white-space: nowrap;
}

.table__pad-lg {
  padding-left: 22px !important;
  padding-right: 22px !important;
}

.table__right {
  text-align: right;
}

.row {
  height: 62px;
  border-top: 1px solid #f4f1f8;
  cursor: pointer;
}

.row:hover,
.row:focus-visible {
  background: #faf8fd;
  outline: none;
}

.table tbody td {
  padding: 0 14px;
  vertical-align: middle;
}

.table__count {
  color: #4b3f60;
}

.table__muted {
  color: #7d7391;
  white-space: nowrap;
}

.table__empty {
  color: #9b8fb0;
}

.row__cta {
  font-size: 13px;
  font-weight: 700;
  color: #8475a0;
  white-space: nowrap;
}

.person {
  display: flex;
  align-items: center;
  gap: 11px;
}

.person__avatar {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border-radius: 999px;
  background: #cbadd8;
  color: #3c2f52;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.person__copy {
  display: flex;
  flex-direction: column;
}

.person__name {
  font-weight: 700;
}

.person__email {
  font-size: 12px;
  color: #9b8fb0;
}

.pill {
  display: inline-flex;
  height: 25px;
  align-items: center;
  padding: 0 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.pill--student {
  background: #dbf2f4;
  color: #065c5d;
}

.pill--staff {
  background: #f0eaf5;
  color: #5c4a75;
}

.card__footer {
  margin-top: auto;
  padding: 16px 22px;
  border-top: 1px solid #f4f1f8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.card__range {
  font-size: 13px;
  color: #7d7391;
}

.pager {
  display: flex;
  gap: 6px;
  align-items: center;
}

.pager__page,
.pager__gap {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: #f5f4f8;
  color: #4b3f60;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
}

.pager__page {
  cursor: pointer;
}

.pager__page:hover {
  background: #f0eaf5;
}

.pager__page--active {
  background: #3c2f52;
  color: #fff;
  font-weight: 700;
}

/* Chips de filtro ---------------------------------------------------- */

.chips {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.chip {
  height: 34px;
  padding: 0 15px;
  display: inline-flex;
  align-items: center;
  border: 1px solid #e2dcec;
  border-radius: 999px;
  background: #fff;
  color: #4b3f60;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.chip:hover {
  border-color: #8475a0;
}

.chip--warn {
  background: #fdf1e3;
  border-color: transparent;
  color: #8a5a1f;
  font-weight: 700;
}

.chip--active {
  background: #3c2f52;
  border-color: #3c2f52;
  color: #fff;
  font-weight: 700;
}

/* Bienestar ----------------------------------------------------------- */

.score {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #065c5d;
  white-space: nowrap;
}

.score__track {
  width: 52px;
  height: 6px;
  border-radius: 999px;
  background: #eef4f5;
  display: inline-block;
  overflow: hidden;
}

.score__fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: #6cc5cb;
}

.score--warn {
  color: #8a5a1f;
}

.score--warn .score__track {
  background: #f5e6d2;
}

.score--warn .score__fill {
  background: #d69a4c;
}

/* Fila que requiere atención ------------------------------------------ */

.row--warn {
  background: #fffaf3;
}

.row--warn:hover,
.row--warn:focus-visible {
  background: #fdf3e6;
}

.person__avatar--warn {
  background: #f3d9b8;
  color: #7a4f14;
}

.row__contact {
  display: inline-flex;
  height: 34px;
  align-items: center;
  padding: 0 14px;
  border-radius: 999px;
  background: #8a5a1f;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.row__contact:hover {
  background: #74491a;
  color: #fff;
}

@media (max-width: 760px) {
  .users__header,
  .users__body {
    padding-left: 20px;
    padding-right: 20px;
  }

  .users__search {
    width: 100%;
  }
}
</style>
