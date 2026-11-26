<script setup lang="ts">
import { getApiErrorMessage } from '~/utils/helpers/http-errors'
import type { IInstitute } from '~/interfaces/institute/institute.interface'
import type { RegistrationInstitute } from '~/interfaces/institution/registration-institute.interface'

const props = defineProps<{ institutions?: RegistrationInstitute[] }>()
const selectedInstitution = ref('')
const { $axios } = useNuxtApp()
const { instituteId, phone, loading, failed, retry } =
  useInstituteEmergencyLine(
    props.institutions ? selectedInstitution : undefined,
  )
const draft = ref('')
const saving = ref(false)
const error = ref('')
const message = ref('')
function clearFeedback() {
  error.value = ''
  message.value = ''
}
watch([instituteId, phone], ([, value]) => {
  draft.value = value
})
watch(instituteId, clearFeedback)
async function save() {
  if (saving.value || !instituteId.value) return
  const id = instituteId.value
  saving.value = true
  error.value = ''
  message.value = ''
  try {
    const { data } = await $axios.patch<Pick<IInstitute, 'emergencyPhone'>>(
      props.institutions
        ? '/institute/' + encodeURIComponent(id) + '/emergency-line'
        : '/institute/emergency-line',
      { emergencyPhone: draft.value.trim() },
    )
    if (id !== instituteId.value) return
    phone.value = data.emergencyPhone ?? ''
    draft.value = phone.value
    message.value = phone.value
      ? 'Línea de emergencia guardada.'
      : 'Línea de emergencia retirada.'
  } catch (e) {
    error.value = getApiErrorMessage(
      e,
      'No pudimos guardar la línea de emergencia.',
    )
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section
    class="specialist-panel specialist-form"
    aria-labelledby="emergency-line-title"
  >
    <h2 id="emergency-line-title">Línea de emergencia</h2>
    <label v-if="institutions"
      >Institución
      <select
        v-model="selectedInstitution"
        :disabled="saving || !institutions.length"
      >
        <option disabled value="">Selecciona una institución</option>
        <option v-for="item in institutions" :key="item._id" :value="item._id">
          {{ item.name }}
        </option>
      </select>
    </label>
    <p v-if="institutions && !institutions.length">
      Todavía no hay instituciones registradas.
    </p>
    <p v-else-if="loading" role="status">Cargando línea de emergencia…</p>
    <div v-else-if="failed">
      <p role="alert">No pudimos cargar la línea de emergencia.</p>
      <button type="button" @click="retry">Reintentar</button>
    </div>
    <form v-else-if="instituteId" @submit.prevent="save">
      <fieldset :disabled="saving">
        <label
          >Teléfono de emergencia (opcional)
          <small
            >Este número aparece en «Conoce especialistas». Para retirar el
            aviso, borra el número y guarda.</small
          >
          <input
            v-model="draft"
            type="tel"
            maxlength="50"
            @input="clearFeedback"
          />
        </label>
        <div class="specialist-actions">
          <button
            class="primary-action"
            type="submit"
            :disabled="!instituteId || draft.trim() === phone"
          >
            {{ saving ? 'Guardando…' : 'Guardar línea de emergencia' }}
          </button>
        </div>
      </fieldset>
    </form>
    <p v-if="error" class="specialist-error" role="alert">{{ error }}</p>
    <p v-if="message" role="status">{{ message }}</p>
  </section>
</template>
