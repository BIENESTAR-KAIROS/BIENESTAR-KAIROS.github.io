<script setup lang="ts">
import type { RegistrationInstitute } from '~/interfaces/institution/registration-institute.interface'
import type {
  SpecialistEntry,
  SpecialistFields,
} from '~/interfaces/specialist/specialist.interface'

const props = defineProps<{
  entry: SpecialistEntry | null
  global: boolean
  institutions: RegistrationInstitute[]
  busy: boolean
  error: string
}>()
const emit = defineEmits<{
  save: [fields: SpecialistFields, instituteId?: string]
  cancel: []
}>()
const heading = ref<HTMLElement>()
const audience = ref(props.entry?.instituteId || '')
const title = ref(props.entry?.title ?? '')
const image = ref(props.entry?.image ?? '')
const specialties = ref(props.entry?.specialties.join('\n') ?? '')
const locations = ref(props.entry?.locations.join('\n') ?? '')
const contacts = ref(props.entry?.contacts.join('\n') ?? '')
const localError = ref('')
onMounted(() => heading.value?.focus())
function lines(text: string) {
  return text
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean)
}
function submit() {
  const fields = {
    title: title.value.trim(),
    image: image.value.trim(),
    specialties: lines(specialties.value),
    locations: lines(locations.value),
    contacts: lines(contacts.value),
  }
  localError.value = ''
  if (!fields.title || !fields.specialties.length || !fields.contacts.length) {
    localError.value =
      'Escribe un nombre, al menos una especialidad y un medio de contacto.'
  } else if (
    [fields.specialties, fields.locations, fields.contacts].some(
      (values) => values.length > 20,
    )
  ) {
    localError.value = 'Puedes incluir hasta 20 líneas por campo.'
  } else if (
    fields.specialties.some((value) => value.length > 160) ||
    fields.locations.some((value) => value.length > 350) ||
    fields.contacts.some((value) => value.length > 254)
  ) {
    localError.value =
      'Cada especialidad admite 160 caracteres, cada ubicación 350 y cada contacto 254.'
  } else {
    emit(
      'save',
      fields,
      props.global && audience.value && audience.value !== 'global'
        ? audience.value
        : undefined,
    )
  }
}
</script>

<template>
  <form class="specialist-panel specialist-form" @submit.prevent="submit">
    <h2 ref="heading" tabindex="-1">
      {{ entry ? 'Editar especialista' : 'Agregar especialista' }}
    </h2>
    <p v-if="entry && global">
      {{
        entry.instituteId
          ? institutions.find((item) => item._id === entry?.instituteId)?.name
          : 'Recomendación de KAIROS para todas las instituciones'
      }}
    </p>
    <fieldset :disabled="busy">
      <label v-if="global && !entry">
        Publicar en
        <select v-model="audience" required>
          <option disabled value="">Elige el directorio</option>
          <option value="global">
            Todas las instituciones · Recomendación de KAIROS
          </option>
          <option
            v-for="institution in institutions"
            :key="institution._id"
            :value="institution._id"
          >
            {{ institution.name }}
          </option>
        </select>
      </label>
      <label
        >Nombre del especialista o servicio<input
          v-model="title"
          required
          maxlength="160"
      /></label>
      <label
        >Especialidades <small>Una por línea.</small
        ><textarea v-model="specialties" required rows="3" />
      </label>
      <label
        >Ubicaciones (opcional) <small>Una dirección por línea.</small
        ><textarea v-model="locations" rows="2" />
      </label>
      <label
        >Contacto
        <small
          >Un correo o teléfono por línea. Puedes indicar la extensión con
          «ext».</small
        ><textarea v-model="contacts" required rows="3" />
      </label>
      <label
        >Enlace de imagen (opcional)
        <small>Si lo dejas vacío, se mostrará la ilustración de KAIROS.</small
        ><input
          v-model="image"
          type="url"
          pattern="https://.+"
          placeholder="https://"
          maxlength="2000"
      /></label>
      <p v-if="localError || error" role="alert" class="specialist-error">
        {{ localError || error }}
      </p>
      <div class="specialist-actions">
        <button class="primary-action" type="submit">
          {{ busy ? 'Guardando…' : 'Guardar especialista' }}
        </button>
        <button type="button" @click="emit('cancel')">Cancelar</button>
      </div>
    </fieldset>
  </form>
</template>
