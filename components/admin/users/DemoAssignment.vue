<script setup lang="ts">
import type { RegistrationInstitute } from '~/interfaces/institution/registration-institute.interface'
import type {
  DemoAssignmentResult,
  DemoUsersStatus,
} from '~/interfaces/user/admin-user.interface'
import { getApiErrorMessage } from '~/utils/helpers/http-errors'
const props = defineProps<{ institutions: RegistrationInstitute[] }>()
const emit = defineEmits<{ changed: [] }>()
const { $axios } = useNuxtApp()
const selected = ref('')
const presets = [10, 50, 100, 500, 1000, 2500, 5000]
const quantity = ref('5000')
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
  const count = assigned.value || 5000
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
  if (!institution.value || busy.value || (value && !validCount.value)) return
  const target = institution.value
  const count = desiredCount.value
  busy.value = true
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
    message.value = value
      ? `${count.toLocaleString('es-MX')} alumnos demo están asignados a ${target.name}. Se generaron ${data.demoResults?.generated ?? 0} resultados nuevos para ${data.demoResults?.questionnaires ?? 0} cuestionarios; los existentes se conservaron.`
      : `Se quitó la asociación de demos con ${target.name}. Los perfiles y su historial se conservan.`
    emit('changed')
  } catch (cause) {
    error.value = getApiErrorMessage(
      cause,
      'No pudimos actualizar la asignación. Revisa el estado y vuelve a intentarlo.',
    )
  } finally {
    busy.value = false
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
      Elige cuántos alumnos del conjunto de 5,000 demos quieres compartir, con
      resultados de ejemplo para cada cuestionario activo y publicado de la
      institución. La cantidad elegida será el total asignado a esa institución.
      Reducirla o quitar la asignación conserva los perfiles, su historial y las
      asignaciones a otras instituciones.
    </p>
    <form class="user-actions" @submit.prevent="setAssignment(true)">
      <label
        >Institución para los demos<select v-model="selected" :disabled="busy">
          <option value="">Elige una institución</option>
          <option v-for="i in institutions" :key="i._id" :value="i._id">
            {{ i.name }}{{ i.active ? '' : ' (inactiva)' }}
          </option>
        </select></label
      >
      <label
        >Cantidad de alumnos demo
        <select v-model="quantity" :disabled="busy || loading">
          <option v-for="count in presets" :key="count" :value="String(count)">
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
            ? 'Preparando resultados…'
            : assigned === desiredCount
              ? 'Completar resultados demo'
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
      <button :disabled="busy" @click="load">Actualizar estado</button>
    </p>
  </section>
</template>
