<script setup lang="ts">
import type { RegistrationInstitute } from '~/interfaces/institution/registration-institute.interface'
import type { DemoUsersStatus } from '~/interfaces/user/admin-user.interface'
import { getApiErrorMessage } from '~/utils/helpers/http-errors'
const props = defineProps<{ institutions: RegistrationInstitute[] }>()
const emit = defineEmits<{ changed: [] }>()
const { $axios } = useNuxtApp()
const selected = ref('')
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
  if (!institution.value || busy.value) return
  const target = institution.value
  busy.value = true
  message.value = ''
  error.value = ''
  try {
    await $axios.patch(`/admin/users/demos/institutions/${target._id}`, {
      assigned: value,
    })
    message.value = value
      ? `Los 5,000 demos están asignados a ${target.name}.`
      : `Se quitó la asociación de demos con ${target.name}. Los perfiles y su historial se conservan.`
    await load()
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
      Comparte el mismo conjunto de 5,000 perfiles, con sus respuestas y
      resultados de ejemplo. Quitar una asignación conserva los datos y las
      asignaciones a otras instituciones.
    </p>
    <div class="user-actions">
      <label
        >Institución para los demos<select v-model="selected" :disabled="busy">
          <option value="">Elige una institución</option>
          <option v-for="i in institutions" :key="i._id" :value="i._id">
            {{ i.name }}{{ i.active ? '' : ' (inactiva)' }}
          </option>
        </select></label
      >
      <button
        class="user-primary"
        :disabled="
          !institution?.active ||
          busy ||
          loading ||
          status?.total !== 5000 ||
          assigned === 5000
        "
        @click="setAssignment(true)"
      >
        Asignar 5,000 demos
      </button>
      <button
        class="user-secondary"
        :disabled="!institution || busy || loading || !status || !assigned"
        @click="setAssignment(false)"
      >
        Quitar demos
      </button>
    </div>
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
