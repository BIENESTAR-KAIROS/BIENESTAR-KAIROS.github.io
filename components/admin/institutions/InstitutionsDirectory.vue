<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import type { RegistrationInstitute } from '~/interfaces/institution/registration-institute.interface'
import { getApiErrorMessage } from '~/utils/helpers/http-errors'

const auth = useAuthStore()
const { $axios } = useNuxtApp()
const route = useRoute()
const studentView = computed(() => route.query.view === 'student')
const institutions = ref<RegistrationInstitute[]>([])
const loading = ref(true)
const loadError = ref('')
const entryError = ref('')
const entering = ref('')
const search = ref('')
const filtered = computed(() => {
  const term = search.value.trim().toLocaleLowerCase()
  return institutions.value.filter((i) =>
    `${i.name} ${i.emailDomains.join(' ')}`.toLocaleLowerCase().includes(term),
  )
})
const created = computed(() =>
  institutions.value.find((i) => i._id === route.query.created),
)

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    institutions.value = (
      await $axios.get<RegistrationInstitute[]>(
        '/institute/registration-directory',
      )
    ).data
  } catch (error) {
    loadError.value = getApiErrorMessage(
      error,
      'No pudimos cargar las instituciones. Vuelve a intentarlo.',
    )
  } finally {
    loading.value = false
  }
}

async function enter(institution: RegistrationInstitute) {
  if (entering.value) return
  entering.value = institution._id
  entryError.value = ''
  try {
    await auth.enterInstitution(
      institution._id,
      studentView.value ? 'student-preview' : 'institution',
    )
    await navigateTo(
      studentView.value ? '/user/dashboard' : '/institute/dashboard',
    )
  } catch (error) {
    auth.clearInstitutionContext()
    entryError.value = getApiErrorMessage(
      error,
      'No pudimos abrir la institución. Vuelve a intentarlo.',
    )
  } finally {
    entering.value = ''
  }
}
onMounted(load)
</script>

<template>
  <main class="institutions" :aria-busy="loading">
    <header class="institutions__heading">
      <div>
        <h1>{{ studentView ? 'Vista de alumno' : 'Instituciones' }}</h1>
        <p>
          {{
            studentView
              ? 'Elige una institución para explorar sus cuestionarios y configuración como alumno. No se guardarán respuestas ni cambios.'
              : 'Consulta las instituciones registradas y entra a su panel para administrarlas.'
          }}
        </p>
      </div>
      <NuxtLink
        v-if="!studentView"
        class="institutions__primary"
        to="/admin/institutions/new"
        >Añadir institución</NuxtLink
      >
    </header>
    <p v-if="created" class="institutions__notice" role="status">
      Se creó {{ created.name }}. Sus usuarios podrán vincularse al verificar su
      correo institucional.
    </p>
    <p
      v-if="auth.institutionContextError"
      class="institutions__error"
      role="alert"
    >
      {{ auth.institutionContextError }}
    </p>
    <p v-if="entryError" class="institutions__error" role="alert">
      {{ entryError }}
    </p>
    <section class="institutions__panel" aria-label="Instituciones registradas">
      <p v-if="loading" role="status">Cargando instituciones…</p>
      <div v-else-if="loadError">
        <p class="institutions__error" role="alert">{{ loadError }}</p>
        <button class="institutions__primary" type="button" @click="load">
          Volver a intentar
        </button>
      </div>
      <template v-else>
        <label class="institutions__search"
          >Buscar institución<input
            v-model="search"
            type="search"
            placeholder="Nombre o dominio"
        /></label>
        <p role="status">
          {{ filtered.length }} de {{ institutions.length }} instituciones
        </p>
        <p v-if="!institutions.length">
          Aún no hay instituciones registradas.
          <template v-if="!studentView">
            Usa «Añadir institución» para crear la primera.
          </template>
        </p>
        <p v-else-if="!filtered.length">
          No hay instituciones que coincidan con tu búsqueda.
        </p>
        <ul v-else class="institutions__list">
          <li v-for="institution in filtered" :key="institution._id">
            <div class="institutions__details">
              <h2>{{ institution.name }}</h2>
              <span
                class="institutions__badge"
                :class="{
                  'institutions__badge--inactive': !institution.active,
                }"
                >{{ institution.active ? 'Activa' : 'Inactiva' }}</span
              >
              <p>
                {{
                  institution.emailDomains.length
                    ? institution.emailDomains.join(', ')
                    : 'Sin dominios configurados'
                }}
              </p>
            </div>
            <button
              class="institutions__secondary"
              type="button"
              :disabled="Boolean(entering)"
              :aria-label="`${studentView ? 'Explorar como alumno de' : 'Entrar a'} ${institution.name}`"
              @click="enter(institution)"
            >
              {{
                entering === institution._id
                  ? 'Abriendo…'
                  : studentView
                    ? 'Explorar como alumno'
                    : 'Entrar a institución'
              }}
            </button>
          </li>
        </ul>
      </template>
    </section>
  </main>
</template>

<style scoped>
.institutions {
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px 36px 48px;
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
}
.institutions__heading {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
h1 {
  font-size: 28px;
  font-weight: 800;
}
h2 {
  display: inline;
  font-size: 20px;
  font-weight: 700;
  margin-right: 12px;
}
p {
  font-size: 15px;
  line-height: 1.6;
  margin: 8px 0 16px;
}
.institutions__panel {
  padding: 28px;
  border: 1px solid #eaf1f2;
  border-radius: 24px;
  background: #fff;
}
.institutions__primary,
.institutions__secondary {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 48px;
  padding: 12px 22px;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
}
.institutions__primary {
  background: #04474a;
  color: white;
}
.institutions__primary:hover {
  background: #065c5d;
}
.institutions__secondary {
  border: 2px solid #cfdddf;
  color: #04474a;
  background: white;
  flex-shrink: 0;
}
.institutions__secondary:hover:not(:disabled) {
  background: #dbf2f4;
}
.institutions__search {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 520px;
  font-weight: 600;
}
input {
  border: 2px solid #dbe7e9;
  border-radius: 999px;
  min-height: 50px;
  padding: 12px 18px;
  background: #f6fcfc;
  color: #0e2a36;
  font: inherit;
  min-width: 0;
}
.institutions__list {
  list-style: none;
  padding: 0;
}
.institutions__list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 24px 0;
  border-top: 1px solid #eaf1f2;
}
.institutions__details {
  min-width: 0;
  overflow-wrap: anywhere;
}
.institutions__details p {
  color: #4b5f68;
  margin-bottom: 0;
}
.institutions__badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: #dbf2f4;
  color: #065c5d;
  font-size: 12px;
  font-weight: 700;
}
.institutions__badge--inactive {
  background: #fbf3e8;
  color: #8a5a15;
}
.institutions__notice {
  padding: 16px;
  border-radius: 16px;
  background: #dbf2f4;
  color: #04474a;
}
.institutions__error {
  color: #8a1c1c;
}
:is(input, button, a):focus-visible {
  outline: 3px solid #065c5d;
  outline-offset: 3px;
}
button:disabled {
  opacity: 0.6;
  cursor: wait;
}
@media (max-width: 720px) {
  .institutions {
    padding: 20px 18px 40px;
  }
  .institutions__panel {
    padding: 20px;
  }
  .institutions__list li {
    align-items: stretch;
    flex-direction: column;
    gap: 16px;
  }
  .institutions__heading {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
