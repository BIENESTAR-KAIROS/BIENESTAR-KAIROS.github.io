<script setup lang="ts">
import type { RegistrationInstitute } from '~/interfaces/institution/registration-institute.interface'
import type {
  DemoAssignmentResult,
  DemoUsersStatus,
} from '~/interfaces/user/admin-user.interface'
import { getApiErrorMessage } from '~/utils/helpers/http-errors'
const props = defineProps<{
  institutions: RegistrationInstitute[]
  institutionId: string
  disabled?: boolean
}>()
const emit = defineEmits<{ changed: []; busy: [value: boolean] }>()
const { $axios } = useNuxtApp()
const selected = computed(() => props.institutionId)
const presets = [10, 50, 100, 500, 1000, 2500, 5000]
const quantity = ref('100')
const customQuantity = ref('')
const desiredCount = computed(() =>
  Number(quantity.value === 'custom' ? customQuantity.value : quantity.value),
)
const validCount = computed(
  () =>
    Number.isInteger(desiredCount.value) &&
    desiredCount.value >= 1 &&
    desiredCount.value <= 5000,
)
const status = ref<DemoUsersStatus | null>(null)
const busy = ref(false)
const loading = ref(false)
const error = ref('')
const message = ref('')
const institution = computed(() =>
  props.institutions.find((i) => i._id === selected.value),
)
const assigned = computed(
  () =>
    status.value?.institutions.find((i) => i._id === selected.value)?.count ||
    0,
)
watch([selected, assigned], () => {
  const count = assigned.value || 100
  quantity.value = presets.includes(count) ? String(count) : 'custom'
  customQuantity.value = presets.includes(count) ? '' : String(count)
  message.value = ''
})
async function load() {
  loading.value = true
  error.value = ''
  try {
    status.value = (
      await $axios.get<DemoUsersStatus>('/admin/users/demos')
    ).data
  } catch (cause) {
    error.value = getApiErrorMessage(
      cause,
      'No pudimos cargar el conjunto demo.',
    )
    status.value = null
  } finally {
    loading.value = false
  }
}
async function setAssignment(value: boolean) {
  if (
    !institution.value ||
    props.disabled ||
    busy.value ||
    (value && !validCount.value)
  )
    return
  const target = institution.value
  const count = desiredCount.value
  busy.value = true
  emit('busy', true)
  let changed = false
  message.value = ''
  error.value = ''
  try {
    const { data } = await $axios.patch<DemoAssignmentResult>(
      `/admin/users/demos/institutions/${target._id}`,
      {
        assigned: value,
        ...(value ? { count } : {}),
      },
    )
    await load()
    if (data.generationMode === 'gowther') {
      message.value = value
        ? `${count.toLocaleString('es-MX')} alumnos demo están asignados a ${target.name}. Los cambios de asignación se procesarán automáticamente para los cuestionarios compatibles cuando el servicio esté disponible. Consulta el estado abajo; las solicitudes canceladas no se vuelven a generar sin un cambio de asignación o una nueva solicitud.`
        : `Se quitó la asignación de demos de ${target.name}. Sus estadísticas de ejemplo se retirarán y limpiarán automáticamente. Los perfiles, el historial compartido y las demos de otras instituciones se conservan.`
    } else {
      message.value = value
        ? `${count.toLocaleString('es-MX')} alumnos demo están asignados a ${target.name}. Se generaron ${data.demoResults?.generated ?? 0} resultados nuevos para ${data.demoResults?.questionnaires ?? 0} cuestionarios; los existentes se conservaron.`
        : `Se quitó la asociación de demos con ${target.name}. Los perfiles y su historial se conservan.`
    }
    changed = true
  } catch (cause) {
    error.value = getApiErrorMessage(
      cause,
      'No pudimos actualizar la asignación. Revisa el estado y vuelve a intentarlo.',
    )
  } finally {
    busy.value = false
    emit('busy', false)
    if (changed) emit('changed')
  }
}
onMounted(load)
</script>
<template>
  <section
    class="user-panel"
    aria-labelledby="demo-title"
    :aria-busy="busy || loading"
  >
    <h2 id="demo-title">Usuarios demo por institución</h2>
    <p>
      Elige cuántos usuarios de ejemplo compartir con {{ institution?.name }}.
      Reducir la cantidad o quitar la asignación conserva los perfiles, su
      historial compartido y las asignaciones a otras instituciones. Consulta
      abajo el estado de las estadísticas demo y ajusta su distribución.
    </p>
    <form @submit.prevent="setAssignment(true)">
      <fieldset
        class="user-actions demo-assignment-fields"
        :disabled="disabled || busy || loading"
      >
        <legend class="demo-sr-only">Cantidad de usuarios demo</legend>
        <label
          >Cantidad de alumnos demo
          <select v-model="quantity" :disabled="busy || loading">
            <option
              v-for="count in presets"
              :key="count"
              :value="String(count)"
            >
              {{ count.toLocaleString('es-MX') }}
            </option>
            <option value="custom">Personalizado</option>
          </select>
        </label>
        <label v-if="quantity === 'custom'"
          >Cantidad personalizada
          <input
            v-model="customQuantity"
            type="number"
            min="1"
            max="5000"
            step="1"
            required
            :disabled="busy || loading"
            aria-describedby="demo-count-help"
            :aria-invalid="customQuantity !== '' && !validCount"
          />
          <small id="demo-count-help">Entre 1 y 5,000 alumnos demo.</small>
        </label>
        <button
          type="submit"
          class="user-primary"
          :disabled="
            !institution?.active ||
            busy ||
            loading ||
            status?.total !== 5000 ||
            !validCount
          "
        >
          {{
            busy
              ? 'Guardando asignación…'
              : assigned === desiredCount
                ? 'Guardar asignación'
                : assigned
                  ? 'Actualizar cantidad'
                  : 'Asignar demos'
          }}
        </button>
        <button
          type="button"
          class="user-secondary"
          :disabled="!institution || busy || loading || !status || !assigned"
          @click="setAssignment(false)"
        >
          Quitar demos
        </button>
      </fieldset>
    </form>
    <p v-if="loading" role="status">Consultando asignaciones…</p>
    <p v-else-if="status" role="status">
      Conjunto disponible:
      {{ status.total.toLocaleString('es-MX') }} demos.<template
        v-if="institution"
      >
        Asignados a {{ institution.name }}:
        {{ assigned.toLocaleString('es-MX') }}.</template
      >
    </p>
    <p v-if="message" class="user-notice" role="status">{{ message }}</p>
    <p v-if="error" class="user-error" role="alert">
      {{ error }}
      <button :disabled="busy || disabled" @click="load">
        Actualizar estado
      </button>
    </p>
  </section>
</template>
