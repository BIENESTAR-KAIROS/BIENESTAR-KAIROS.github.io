<script setup lang="ts">
import type {
  SpecialistEntry,
  SpecialistFields,
} from '~/interfaces/specialist/specialist.interface'
import type { RegistrationInstitute } from '~/interfaces/institution/registration-institute.interface'
import type {
  CreateSpecialistDto,
  EditSpecialistDto,
} from '~/dto/specialist/save-specialist.dto'
import { getApiErrorMessage, hasErrorStatus } from '~/utils/helpers/http-errors'
import SpecialistEditor from './SpecialistEditor.vue'

const props = defineProps<{ global?: boolean }>()
const { $axios } = useNuxtApp()
const entries = ref<SpecialistEntry[]>([])
const institutions = ref<RegistrationInstitute[]>([])
const loading = ref(true)
const loadError = ref('')
const actionError = ref('')
const message = ref('')
const busy = ref(false)
const editing = ref(false)
const current = ref<SpecialistEntry | null>(null)
const confirming = ref('')
const search = ref('')
const addButton = ref<HTMLButtonElement>()
let returnFocus: HTMLElement | null = null
const owners = computed(
  () => new Map(institutions.value.map((item) => [item._id, item.name])),
)
function origin(entry: SpecialistEntry) {
  if (!entry.instituteId) return 'Recomendación de KAIROS'
  return props.global
    ? owners.value.get(entry.instituteId) || 'Institución'
    : 'Especialista de tu institución'
}
const filtered = computed(() => {
  const term = search.value.trim().toLocaleLowerCase()
  return entries.value.filter((entry) =>
    [entry.title, origin(entry), ...entry.specialties]
      .join(' ')
      .toLocaleLowerCase()
      .includes(term),
  )
})
async function load() {
  loading.value = true
  loadError.value = ''
  actionError.value = ''
  confirming.value = ''
  try {
    const [directory, institutes] = await Promise.all([
      $axios.get<SpecialistEntry[]>('/specialist/management'),
      props.global
        ? $axios.get<RegistrationInstitute[]>(
            '/institute/registration-directory',
          )
        : undefined,
    ])
    entries.value = directory.data
    institutions.value = institutes?.data ?? []
  } catch (e) {
    loadError.value = getApiErrorMessage(e, 'No pudimos cargar el directorio.')
  } finally {
    loading.value = false
  }
}
onMounted(load)
function edit(entry: SpecialistEntry | null, event: Event) {
  returnFocus = event.currentTarget as HTMLElement
  message.value = ''
  actionError.value = ''
  confirming.value = ''
  current.value = entry
  editing.value = true
}
async function closeEditor() {
  editing.value = false
  actionError.value = ''
  await nextTick()
  const previous = returnFocus?.isConnected ? returnFocus : addButton.value
  previous?.focus()
}
async function save(fields: SpecialistFields, instituteId?: string) {
  if (busy.value) return
  busy.value = true
  actionError.value = ''
  try {
    if (current.value) {
      const dto: EditSpecialistDto = {
        ...fields,
        revision: current.value.revision,
      }
      await $axios.patch('/specialist/' + current.value._id, dto)
    } else {
      const dto: CreateSpecialistDto = { ...fields, instituteId }
      await $axios.post('/specialist', dto)
    }
    message.value = 'Ficha guardada.'
    await load()
    busy.value = false
    await closeEditor()
  } catch (e) {
    if (hasErrorStatus(e, 409)) {
      await load()
      actionError.value =
        'La ficha cambió. Cancela la edición y vuelve a abrirla para ver la versión más reciente.'
    } else
      actionError.value = getApiErrorMessage(
        e,
        'No pudimos guardar la ficha. Revisa los datos e intenta de nuevo.',
      )
  } finally {
    busy.value = false
  }
}

async function updateList(entry: SpecialistEntry, archive: boolean) {
  if (busy.value) return
  busy.value = true
  actionError.value = ''
  message.value = ''
  try {
    if (archive) {
      await $axios.patch('/specialist/' + entry._id + '/archive', {
        revision: entry.revision,
      })
      entries.value = entries.value.filter((item) => item._id !== entry._id)
      message.value = 'Ficha archivada.'
      confirming.value = ''
      busy.value = false
      await nextTick()
      addButton.value?.focus()
    } else {
      await $axios.patch('/specialist/' + entry._id + '/visibility', {
        visible: !entry.visible,
      })
      entry.visible = !entry.visible
      message.value = entry.visible
        ? 'Especialista reincorporado a tu directorio.'
        : 'Especialista retirado de tu directorio.'
    }
  } catch (e) {
    actionError.value = getApiErrorMessage(
      e,
      'No pudimos actualizar el directorio. Intenta de nuevo.',
    )
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="specialist-manager" :class="{ 'global-directory': global }">
    <header>
      <h1>Especialistas</h1>
      <p>
        {{
          global
            ? 'Administra las recomendaciones de KAIROS y los especialistas de cada institución.'
            : 'Elige qué recomendaciones de KAIROS verá tu comunidad y agrega los especialistas de tu institución.'
        }}
      </p>
    </header>
    <p v-if="message" role="status">{{ message }}</p>
    <SpecialistEditor
      v-if="editing"
      :entry="current"
      :global="!!global"
      :institutions="institutions"
      :busy="busy"
      :error="actionError"
      @save="save"
      @cancel="closeEditor"
    />
    <template v-else>
      <p v-if="loading" role="status">Cargando especialistas…</p>
      <div v-else-if="loadError" class="specialist-panel">
        <p role="alert" class="specialist-error">{{ loadError }}</p>
        <button type="button" @click="load">Reintentar</button>
      </div>
      <template v-else>
        <div class="specialist-toolbar">
          <label
            >Buscar especialista<input
              v-model="search"
              type="search"
              :placeholder="
                global
                  ? 'Nombre, institución o especialidad'
                  : 'Nombre o especialidad'
              "
          /></label>
          <button
            ref="addButton"
            type="button"
            class="primary-action"
            :disabled="busy"
            @click="edit(null, $event)"
          >
            Agregar especialista
          </button>
        </div>
        <div v-if="actionError" class="specialist-panel">
          <p role="alert" class="specialist-error">{{ actionError }}</p>
          <button type="button" @click="load">Actualizar directorio</button>
        </div>
        <p v-if="!filtered.length" class="specialist-panel">
          {{
            entries.length
              ? 'No encontramos coincidencias.'
              : 'Todavía no hay especialistas en este directorio.'
          }}
        </p>
        <ul v-else class="specialist-list">
          <li
            v-for="entry in filtered"
            :key="entry._id"
            class="specialist-panel"
          >
            <div class="specialist-copy">
              <span>{{ origin(entry) }}</span>
              <h2>{{ entry.title }}</h2>
              <p>{{ entry.specialties.join(' · ') }}</p>
              <details>
                <summary>Ver datos de atención</summary>
                <p v-for="place in entry.locations" :key="place">{{ place }}</p>
                <p v-if="entry.officeHours" class="specialist-hours">
                  <strong>Horario de atención</strong><br />{{
                    entry.officeHours
                  }}
                </p>
                <p v-for="contact in entry.contacts" :key="contact">
                  {{ contact }}
                </p>
              </details>
              <strong v-if="!global && !entry.instituteId">{{
                entry.visible
                  ? 'Visible en tu directorio'
                  : 'Retirado de tu directorio'
              }}</strong>
            </div>
            <div
              v-if="!global && !entry.instituteId"
              class="specialist-actions"
            >
              <button
                type="button"
                :disabled="busy"
                :aria-label="
                  (entry.visible ? 'Retirar ' : 'Reincorporar ') + entry.title
                "
                @click="updateList(entry, false)"
              >
                {{
                  entry.visible ? 'Retirar de mi directorio' : 'Reincorporar'
                }}
              </button>
            </div>
            <div
              v-else-if="confirming === entry._id"
              class="specialist-confirm"
            >
              <p>
                ¿Archivar «{{ entry.title }}»?
                {{
                  entry.instituteId
                    ? 'Se retirará del directorio de su institución.'
                    : 'Se retirará de todas las instituciones.'
                }}
              </p>
              <div class="specialist-actions">
                <button
                  type="button"
                  :disabled="busy"
                  @click="updateList(entry, true)"
                >
                  Confirmar archivo</button
                ><button
                  type="button"
                  :disabled="busy"
                  @click="confirming = ''"
                >
                  Cancelar
                </button>
              </div>
            </div>
            <div v-else class="specialist-actions">
              <button
                type="button"
                :disabled="busy"
                :aria-label="'Editar ' + entry.title"
                @click="edit(entry, $event)"
              >
                Editar
              </button>
              <button
                type="button"
                :disabled="busy"
                :aria-label="'Archivar ' + entry.title"
                @click="confirming = entry._id"
              >
                Archivar
              </button>
            </div>
          </li>
        </ul>
      </template>
    </template>
  </main>
</template>

<style>
.specialist-manager {
  --directory-accent: #5c4a75;
  --directory-bg: #f5f4f8;
  --directory-border: #ded9e6;
  --directory-text: #30273e;
  font-family: 'Figtree', sans-serif;
  color: var(--directory-text);
  min-height: 100%;
  background: var(--directory-bg);
  padding: 24px 32px 40px;
  display: grid;
  align-content: start;
  gap: 20px;
}
.specialist-manager.global-directory {
  --directory-accent: #04474a;
  --directory-bg: #f4f8f9;
  --directory-border: #d9e6e6;
  --directory-text: #0e2a36;
}
.specialist-manager h1 {
  font-size: 28px;
  line-height: 1.25;
  margin-bottom: 6px;
}
.specialist-manager h2 {
  font-size: 20px;
  line-height: 1.3;
}
.specialist-manager p {
  font-size: 15px;
  line-height: 1.5;
}
.specialist-manager .specialist-panel {
  border: 1px solid var(--directory-border);
  border-radius: 22px;
  background: #fff;
  padding: 22px;
}
.specialist-manager .specialist-toolbar,
.specialist-manager li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
}
.specialist-manager .specialist-toolbar {
  align-items: flex-end;
}
.specialist-manager .specialist-toolbar label {
  flex: 1 1 260px;
  max-width: 520px;
}
.specialist-manager .specialist-list {
  list-style: none;
  display: grid;
  gap: 12px;
  padding: 0;
}
.specialist-manager .specialist-copy {
  display: grid;
  gap: 4px;
  flex: 1 1 240px;
  min-width: 0;
  overflow-wrap: anywhere;
}
.specialist-manager .specialist-copy :is(span, strong) {
  color: var(--directory-accent);
  font-size: 13px;
  font-weight: 700;
}
.specialist-manager .specialist-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.specialist-manager summary {
  cursor: pointer;
  width: fit-content;
  padding: 10px 0;
  color: var(--directory-accent);
  font-weight: 700;
}
.specialist-manager .specialist-hours {
  white-space: pre-line;
}
.specialist-manager button {
  min-height: 44px;
  padding: 8px 18px;
  border: 1px solid var(--directory-accent);
  color: var(--directory-accent);
  border-radius: 999px;
  font-weight: 700;
  background: white;
}
.specialist-manager button:hover {
  background: var(--directory-bg);
}
.specialist-manager .primary-action {
  background: var(--directory-accent);
  color: white;
}
.specialist-manager button:disabled {
  opacity: 0.6;
}
.specialist-manager .specialist-form {
  width: 100%;
  max-width: 760px;
}
.specialist-manager fieldset {
  border: 0;
  padding: 0;
  margin-top: 18px;
  min-width: 0;
  display: grid;
  gap: 16px;
}
.specialist-manager label {
  display: grid;
  gap: 6px;
  font-weight: 700;
  font-size: 15px;
}
.specialist-manager small {
  font-weight: 400;
  font-size: 14px;
}
.specialist-manager :is(input, textarea, select) {
  min-height: 46px;
  min-width: 0;
  width: 100%;
  border: 1px solid #809097;
  border-radius: 12px;
  padding: 10px 12px;
  background: #fff;
  color: var(--directory-text);
  font: inherit;
  font-weight: 400;
}
.specialist-manager select {
  appearance: auto;
}
.specialist-manager textarea {
  resize: vertical;
}
.specialist-manager :focus-visible {
  outline: 3px solid var(--directory-accent);
  outline-offset: 2px;
}
.specialist-manager .specialist-error {
  color: #8a1c1c;
}
.specialist-manager .specialist-confirm {
  display: grid;
  gap: 8px;
}
@media (max-width: 720px) {
  .specialist-manager {
    padding: 20px 16px 32px;
  }
  .specialist-manager .specialist-panel {
    padding: 18px;
  }
  .specialist-manager h1 {
    font-size: 23px;
  }
}
</style>
