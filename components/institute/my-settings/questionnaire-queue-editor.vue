<script setup lang="ts">
import { isAxiosError } from 'axios'
import type {
  InstituteSetting,
  QuestionnaireQueueOption,
} from '~/interfaces/institute/institute-setting.interface'

const props = defineProps<{
  instituteId: string
  setting: InstituteSetting
  blocked: boolean
}>()
const emit = defineEmits<{
  saved: [setting: InstituteSetting]
  busy: [value: boolean]
}>()
const { $axios } = useNuxtApp()
type Row = QuestionnaireQueueOption & {
  selected: boolean
  order: number | string
  unavailable?: boolean
}
const rows = ref<Row[]>([])
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const saveError = ref('')
const savedMessage = ref('')
let disposed = false
const selected = computed(() => rows.value.filter((row) => row.selected))
const queue = computed(() =>
  selected.value
    .map((row) => ({ questionnaireId: row.id, order: Number(row.order) }))
    .sort((a, b) => a.order - b.order),
)
const normalize = (value: InstituteSetting['queue']) =>
  JSON.stringify(
    value
      .map((entry) => ({
        questionnaireId: entry.questionnaireId,
        order: entry.order,
      }))
      .sort(
        (a, b) =>
          a.order - b.order ||
          a.questionnaireId.localeCompare(b.questionnaireId),
      ),
  )
const dirty = computed(
  () => normalize(queue.value) !== normalize(props.setting.queue),
)
const validation = computed(() => {
  if (selected.value.some((row) => row.unavailable))
    return 'Desmarca los cuestionarios que ya no están disponibles antes de guardar.'
  if (
    selected.value.some(
      (row) =>
        !Number.isSafeInteger(Number(row.order)) || Number(row.order) < 1,
    )
  )
    return 'Indica un número entero mayor o igual a 1 para cada cuestionario seleccionado.'
  if (new Set(queue.value.map((row) => row.order)).size !== queue.value.length)
    return 'Cada cuestionario debe tener un número de orden distinto.'
  return ''
})
const preview = computed(() =>
  [...selected.value].sort((a, b) => Number(a.order) - Number(b.order)),
)

function resetRows(
  options: QuestionnaireQueueOption[],
  setting: InstituteSetting,
) {
  const existing = new Map(
    setting.queue.map((entry) => [entry.questionnaireId, entry.order]),
  )
  const available = new Set(options.map((option) => option.id))
  rows.value = [
    ...options.map((option) => ({
      ...option,
      selected: existing.has(option.id),
      order: existing.get(option.id) ?? '',
    })),
    ...setting.queue
      .filter((entry) => !available.has(entry.questionnaireId))
      .map((entry) => ({
        id: entry.questionnaireId,
        title: 'Cuestionario no disponible',
        active: false,
        selected: true,
        order: entry.order,
        unavailable: true,
      })),
  ].sort(
    (a, b) =>
      Number(b.selected) - Number(a.selected) ||
      (a.selected && b.selected
        ? Number(a.order) - Number(b.order)
        : a.title.localeCompare(b.title)),
  )
}

async function loadOptions(setting = props.setting) {
  loading.value = true
  loadError.value = ''
  try {
    const { data } = await $axios.get<QuestionnaireQueueOption[]>(
      `/institute-setting/institute/${props.instituteId}/queue-options`,
    )
    if (!disposed) resetRows(data, setting)
  } catch {
    if (!disposed)
      loadError.value =
        'No pudimos cargar los cuestionarios disponibles. Vuelve a intentarlo.'
  } finally {
    if (!disposed) loading.value = false
  }
}

function clearFeedback() {
  savedMessage.value = ''
  saveError.value = ''
}

function changeSelection(row: Row) {
  savedMessage.value = ''
  saveError.value = ''
  if (
    row.selected &&
    (!row.order ||
      rows.value.some(
        (other) =>
          other !== row &&
          other.selected &&
          Number(other.order) === Number(row.order),
      ))
  ) {
    row.order =
      Math.max(
        0,
        ...rows.value
          .filter((other) => other !== row && other.selected)
          .map((other) => Number(other.order) || 0),
      ) + 1
  }
}

function discard() {
  resetRows(
    rows.value.filter((row) => !row.unavailable),
    props.setting,
  )
  saveError.value = ''
  savedMessage.value = ''
}

async function save() {
  if (saving.value || props.blocked || validation.value || !dirty.value) return
  saving.value = true
  emit('busy', true)
  saveError.value = ''
  savedMessage.value = ''
  try {
    const { data } = await $axios.patch<InstituteSetting>(
      `/institute-setting/institute/${props.instituteId}/queue`,
      { queue: queue.value },
    )
    if (disposed) return
    emit('saved', data)
    savedMessage.value = 'Selección y orden guardados.'
    await loadOptions(data)
  } catch (error) {
    if (disposed) return
    const message = isAxiosError(error)
      ? error.response?.data?.message
      : undefined
    saveError.value =
      typeof message === 'string' &&
      isAxiosError(error) &&
      error.response?.status === 400
        ? message
        : 'No pudimos confirmar el guardado. Tus cambios siguen aquí; puedes volver a guardar la misma secuencia.'
  } finally {
    if (!disposed) {
      saving.value = false
      emit('busy', false)
    }
  }
}

onMounted(() => loadOptions())
onBeforeUnmount(() => {
  disposed = true
})
</script>

<template>
  <form
    class="queue-editor"
    aria-labelledby="queue-editor-title"
    :aria-busy="saving || loading"
    @submit.prevent="save"
  >
    <h3 id="queue-editor-title">Cuestionarios de la secuencia</h3>
    <p id="queue-help" class="queue-help">
      Marca los cuestionarios que quieres incluir y asigna su orden: 1 se
      muestra primero. Los cambios se aplican al guardar.
    </p>
    <p v-if="loading" role="status">Cargando cuestionarios…</p>
    <div v-else-if="loadError">
      <p role="alert" class="queue-error">{{ loadError }}</p>
      <button
        type="button"
        class="queue-button queue-button--secondary"
        @click="loadOptions()"
      >
        Reintentar
      </button>
    </div>
    <template v-else>
      <fieldset :disabled="saving || blocked" aria-describedby="queue-help">
        <legend class="sr-only">Selección y orden de los cuestionarios</legend>
        <div
          v-for="(row, index) in rows"
          :key="row.id"
          class="queue-row"
          :class="{ 'queue-row--selected': row.selected }"
        >
          <label class="queue-choice" :for="`queue-check-${index}`">
            <input
              :id="`queue-check-${index}`"
              v-model="row.selected"
              type="checkbox"
              :disabled="row.unavailable && !row.selected"
              @change="changeSelection(row)"
            />
            <span class="queue-copy">
              <span class="queue-title">{{ row.title }}</span>
              <span v-if="row.unavailable" class="queue-meta"
                >Ya no está disponible. Desmárcalo para retirarlo.</span
              >
              <span v-else-if="row.status === 'draft'" class="queue-meta"
                >Borrador · Sin publicar</span
              >
              <span v-else-if="!row.active" class="queue-meta">Inactivo</span>
            </span>
          </label>
          <div class="queue-order">
            <label :for="`queue-order-${index}`"
              >Orden<span class="sr-only"> de {{ row.title }}</span></label
            >
            <input
              :id="`queue-order-${index}`"
              v-model.number="row.order"
              type="number"
              min="1"
              step="1"
              :max="Number.MAX_SAFE_INTEGER"
              inputmode="numeric"
              :disabled="!row.selected || row.unavailable"
              :aria-invalid="row.selected && !!validation"
              :aria-describedby="validation ? 'queue-validation' : undefined"
              @input="clearFeedback"
            />
          </div>
        </div>
      </fieldset>
      <p
        v-if="validation"
        id="queue-validation"
        role="alert"
        class="queue-error"
      >
        {{ validation }}
      </p>
      <div v-else class="queue-preview">
        <h4>Orden de presentación</h4>
        <ol v-if="preview.length">
          <li v-for="row in preview" :key="row.id" :value="Number(row.order)">
            {{ row.title }}
          </li>
        </ol>
        <p v-else>La secuencia quedará sin cuestionarios.</p>
      </div>
      <div class="queue-actions">
        <span v-if="dirty" class="queue-meta">Cambios sin guardar</span>
        <button
          type="button"
          class="queue-button queue-button--secondary"
          :disabled="!dirty || saving || blocked"
          @click="discard"
        >
          Descartar cambios
        </button>
        <button
          type="submit"
          class="queue-button"
          :disabled="!dirty || !!validation || saving || blocked"
        >
          {{ saving ? 'Guardando…' : 'Guardar secuencia' }}
        </button>
      </div>
      <p v-if="saveError" class="queue-error" role="alert">{{ saveError }}</p>
    </template>
    <p class="queue-success" role="status">{{ savedMessage }}</p>
  </form>
</template>

<style scoped>
.queue-editor {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #efebf5;
}
h3 {
  font-size: 18px;
  line-height: 1.4;
}
.queue-help {
  color: #645b71;
  font-size: 14px;
  line-height: 1.6;
  margin: 8px 0 20px;
}
fieldset {
  border: 0;
  min-width: 0;
}
.queue-row {
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #ded6ea;
  padding: 12px 16px;
  border-radius: 16px;
  margin-bottom: 10px;
}
.queue-row--selected {
  background: #faf9fc;
  border-color: #a99cbb;
}
.queue-choice {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 12px;
  min-height: 44px;
  min-width: 0;
  cursor: pointer;
}
.queue-choice input {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  accent-color: #6d5f88;
}
.queue-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.queue-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.queue-meta {
  font-size: 12px;
  color: #645b71;
  line-height: 1.5;
}
.queue-order {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 0 0 76px;
}
.queue-order label {
  font-size: 12px;
  font-weight: 600;
}
.queue-order input {
  width: 76px;
  min-height: 44px;
  padding: 8px;
  border: 1px solid #746a80;
  border-radius: 10px;
  background: white;
  color: #3c2f52;
  font-size: 16px;
}
.queue-order input:disabled {
  background: #f1eef5;
  color: #746a80;
  border-color: #ded6ea;
}
input:focus-visible,
button:focus-visible {
  outline: 3px solid #3c2f52;
  outline-offset: 3px;
}
.queue-error {
  color: #983d48;
  font-size: 14px;
  margin-top: 14px;
  line-height: 1.5;
}
.queue-preview {
  background: #f5f4f8;
  border-radius: 16px;
  padding: 16px 20px;
  margin-top: 20px;
  font-size: 13px;
  line-height: 1.65;
}
.queue-preview h4 {
  font-size: 13px;
  margin-bottom: 8px;
}
.queue-preview ol {
  padding-left: 22px;
}
.queue-preview li {
  padding-left: 4px;
  margin: 4px 0;
}
.queue-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
.queue-actions > span {
  margin-right: auto;
}
.queue-button {
  min-height: 44px;
  padding: 10px 18px;
  border-radius: 999px;
  background: #6d5f88;
  color: #fff;
  border: 1px solid #6d5f88;
  font-size: 14px;
  font-weight: 600;
}
.queue-button--secondary {
  background: #fff;
  color: #3c2f52;
  border-color: #a99cbb;
}
.queue-button:disabled {
  opacity: 0.5;
  cursor: default;
}
.queue-success {
  color: #286147;
  font-size: 14px;
  line-height: 1.5;
}
.queue-success:not(:empty) {
  margin-top: 16px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
@media (max-width: 600px) {
  .queue-row {
    padding: 12px;
    gap: 8px;
  }
  .queue-choice {
    gap: 8px;
  }
  .queue-order,
  .queue-order input {
    width: 64px;
    flex-basis: 64px;
  }
  .queue-actions > span {
    width: 100%;
  }
  .queue-actions > button {
    flex: 1;
  }
}
</style>
