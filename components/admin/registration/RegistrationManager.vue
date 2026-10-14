<script setup lang="ts">
import type {
  CreateRegistrationInstitute,
  RegistrationInstitute,
} from '~/interfaces/institution/registration-institute.interface'
import { getApiErrorMessage } from '~/utils/helpers/http-errors'

const props = withDefaults(defineProps<{ mode?: 'whitelist' | 'create' }>(), {
  mode: 'whitelist',
})
const { $axios } = useNuxtApp()
const domains = ref<string[]>([])
const loading = ref(true)
const loadError = ref('')
const domain = ref('')
const domainBusy = ref(false)
const domainError = ref('')
const domainMessage = ref('')
const removeDomain = ref('')
const removalPanel = ref<HTMLElement | null>(null)
const domainInput = ref<HTMLInputElement | null>(null)
const instituteBusy = ref(false)
const instituteError = ref('')
const instituteMessage = ref('')
const institutionDomains = ref('')
const emptyInstitution = (): CreateRegistrationInstitute => ({
  name: '',
  businessName: '',
  address: '',
  phoneNumber: '',
  contactEmail: '',
  emailDomains: [],
})
const institution = ref(emptyInstitution())
const normalizeDomain = (value: string) => value.trim().toLowerCase()

async function load() {
  if (!loading.value) loading.value = true
  loadError.value = ''
  try {
    const whitelist = await $axios.get<string[]>('/registration-policy/domains')
    domains.value = whitelist.data
  } catch (error) {
    loadError.value = getApiErrorMessage(
      error,
      'No pudimos cargar la configuración. Vuelve a intentarlo.',
    )
  } finally {
    loading.value = false
  }
}

async function addDomain() {
  if (domainBusy.value) return
  domainError.value = ''
  domainMessage.value = ''
  const value = normalizeDomain(domain.value)
  if (!value || value.includes('@') || value.includes('*')) {
    domainError.value =
      'Escribe el dominio sin @ ni comodines, por ejemplo: gmail.com.'
    return
  }
  if (domains.value.includes(value)) {
    domainError.value = 'Ese dominio ya está permitido.'
    return
  }
  domainBusy.value = true
  try {
    const { data } = await $axios.post<string[]>(
      '/registration-policy/domains',
      { domain: value },
    )
    domains.value = data
    domain.value = ''
    domainMessage.value = `Se agregó ${value} a los dominios permitidos.`
  } catch (error) {
    domainError.value = getApiErrorMessage(
      error,
      'No pudimos agregar el dominio. Vuelve a intentarlo.',
    )
  } finally {
    domainBusy.value = false
  }
}

async function requestRemoval(value: string) {
  removeDomain.value = value
  await nextTick()
  removalPanel.value?.focus()
}

async function closeRemoval() {
  removeDomain.value = ''
  await nextTick()
  domainInput.value?.focus()
}

async function confirmRemoval() {
  if (domainBusy.value || !removeDomain.value) return
  const value = removeDomain.value
  domainBusy.value = true
  domainError.value = ''
  domainMessage.value = ''
  try {
    const { data } = await $axios.delete<string[]>(
      `/registration-policy/domains/${encodeURIComponent(value)}`,
    )
    domains.value = data
    removeDomain.value = ''
    domainMessage.value = `Se retiró ${value}. Las cuentas ya verificadas conservan su acceso.`
  } catch (error) {
    domainError.value = getApiErrorMessage(
      error,
      'No pudimos quitar el dominio. Vuelve a intentarlo.',
    )
  } finally {
    domainBusy.value = false
    if (!removeDomain.value) {
      await nextTick()
      domainInput.value?.focus()
    }
  }
}

async function createInstitution() {
  if (instituteBusy.value) return
  instituteError.value = ''
  instituteMessage.value = ''
  const emailDomains = [
    ...new Set(
      institutionDomains.value
        .split(/[\s,;]+/)
        .filter(Boolean)
        .map(normalizeDomain),
    ),
  ]
  if (!emailDomains.length) {
    instituteError.value = 'Agrega al menos un dominio institucional.'
    return
  }
  instituteBusy.value = true
  try {
    const payload: CreateRegistrationInstitute = {
      ...institution.value,
      name: institution.value.name.trim(),
      businessName: institution.value.businessName.trim(),
      address: institution.value.address.trim(),
      phoneNumber: institution.value.phoneNumber.trim(),
      contactEmail: institution.value.contactEmail.trim().toLowerCase(),
      emailDomains,
    }
    const { data } = await $axios.post<{ institute: RegistrationInstitute }>(
      '/institute',
      payload,
    )
    await navigateTo({
      path: '/admin/institutions',
      query: { created: data.institute._id },
    })
    instituteMessage.value = `Se creó ${payload.name}. Sus usuarios se vincularán al confirmar su correo institucional.`
    institution.value = emptyInstitution()
    institutionDomains.value = ''
  } catch (error) {
    instituteError.value = getApiErrorMessage(
      error,
      'No pudimos crear la institución. Revisa los datos e inténtalo de nuevo.',
    )
  } finally {
    instituteBusy.value = false
  }
}

onMounted(() => {
  if (props.mode === 'whitelist') void load()
  else loading.value = false
})
</script>

<template>
  <main class="registration-manager" :aria-busy="loading">
    <header class="registration-manager__heading">
      <NuxtLink
        v-if="props.mode === 'create'"
        to="/admin/institutions"
        class="registration-manager__back"
        >Volver a instituciones</NuxtLink
      >
      <h1>
        {{
          props.mode === 'create' ? 'Añadir institución' : 'Registro y acceso'
        }}
      </h1>
      <p>
        {{
          props.mode === 'create'
            ? 'Registra sus datos de contacto y dominios para vincular a sus usuarios.'
            : 'Configura los dominios permitidos para crear cuentas independientes.'
        }}
      </p>
    </header>
    <p v-if="loading" role="status">Cargando configuración…</p>
    <div v-else-if="loadError" class="registration-manager__error" role="alert">
      <p>{{ loadError }}</p>
      <button type="button" class="registration-manager__button" @click="load">
        Volver a intentar
      </button>
    </div>
    <template v-else>
      <section
        v-if="props.mode === 'whitelist'"
        class="registration-manager__panel"
        aria-labelledby="domains-title"
      >
        <h2 id="domains-title">Dominios permitidos</h2>
        <p>
          Los correos personales permiten acceder al Cuestionario de Bienestar
          Emocional y a los demás recursos de Kairos.
        </p>
        <p class="registration-manager__note">
          Verificar un correo @siatsa.com concede acceso a la administración
          general. Los dominios institucionales se configuran por separado.
        </p>
        <form
          class="registration-manager__domain-form"
          @submit.prevent="addDomain"
        >
          <label>
            <span>Nuevo dominio</span>
            <input
              ref="domainInput"
              v-model="domain"
              type="text"
              required
              placeholder="ejemplo.com"
              autocomplete="off"
              autocapitalize="none"
              :disabled="domainBusy"
              aria-describedby="domain-help"
            />
          </label>
          <button
            class="registration-manager__button"
            type="submit"
            :disabled="domainBusy"
          >
            {{ domainBusy ? 'Guardando…' : 'Agregar dominio' }}
          </button>
        </form>
        <p id="domain-help" class="registration-manager__hint">
          Escribe el dominio completo, sin @. Los subdominios necesitan su
          propia entrada.
        </p>
        <p v-if="domainError" class="registration-manager__error" role="alert">
          {{ domainError }}
        </p>
        <p
          v-if="domainMessage"
          class="registration-manager__success"
          role="status"
        >
          {{ domainMessage }}
        </p>
        <p v-if="!domains.length" class="registration-manager__note">
          No hay dominios personales permitidos. Agrega uno para habilitar
          nuevos registros independientes.
        </p>
        <ul v-else class="registration-manager__domains">
          <li v-for="allowed in domains" :key="allowed">
            <span
              >{{ allowed
              }}<small v-if="allowed === 'siatsa.com'"
                >Administración KAIROS</small
              ></span
            >
            <button
              class="registration-manager__text-button"
              type="button"
              :disabled="domainBusy"
              :aria-label="`Quitar ${allowed}`"
              @click="requestRemoval(allowed)"
            >
              Quitar
            </button>
          </li>
        </ul>
        <div
          v-if="removeDomain"
          ref="removalPanel"
          tabindex="-1"
          class="registration-manager__confirmation"
          role="group"
          aria-label="Confirmar retiro de dominio"
        >
          <p>
            ¿Quitar <strong>{{ removeDomain }}</strong
            >? Se bloquearán nuevos registros y verificaciones pendientes de
            este dominio. Las cuentas verificadas conservarán su acceso.
          </p>
          <div class="registration-manager__actions">
            <button
              type="button"
              class="registration-manager__button"
              :disabled="domainBusy"
              @click="confirmRemoval"
            >
              Confirmar retiro
            </button>
            <button
              type="button"
              class="registration-manager__secondary"
              :disabled="domainBusy"
              @click="closeRemoval"
            >
              Cancelar
            </button>
          </div>
        </div>
      </section>

      <section
        v-if="props.mode === 'create'"
        class="registration-manager__panel"
        aria-labelledby="institutions-title"
      >
        <h2 id="institutions-title">Datos de la institución</h2>
        <form
          class="registration-manager__institution-form"
          @submit.prevent="createInstitution"
        >
          <fieldset :disabled="instituteBusy">
            <legend class="registration-manager__sr-only">
              Datos de la nueva institución
            </legend>
            <label
              ><span>Nombre</span
              ><input
                v-model="institution.name"
                required
                maxlength="200"
                autocomplete="organization"
            /></label>
            <label
              ><span>Razón social</span
              ><input
                v-model="institution.businessName"
                required
                maxlength="200"
            /></label>
            <label class="registration-manager__wide"
              ><span>Dirección</span
              ><input
                v-model="institution.address"
                required
                maxlength="500"
                autocomplete="street-address"
            /></label>
            <label
              ><span>Teléfono de contacto</span
              ><input
                v-model="institution.phoneNumber"
                type="tel"
                required
                maxlength="40"
                autocomplete="tel"
            /></label>
            <label
              ><span>Correo de contacto</span
              ><input
                v-model="institution.contactEmail"
                type="email"
                required
                autocomplete="email"
            /></label>
            <label class="registration-manager__wide"
              ><span>Dominios institucionales</span
              ><textarea
                v-model="institutionDomains"
                required
                rows="2"
                placeholder="universidad.edu.mx"
                aria-describedby="institution-domain-help"
              />
            </label>
          </fieldset>
          <p id="institution-domain-help" class="registration-manager__hint">
            Separa varios dominios con comas. Cada dominio pertenece a una sola
            institución y debe estar fuera de la lista de acceso independiente.
          </p>
          <p
            v-if="instituteError"
            class="registration-manager__error"
            role="alert"
          >
            {{ instituteError }}
          </p>
          <p
            v-if="instituteMessage"
            class="registration-manager__success"
            role="status"
          >
            {{ instituteMessage }}
          </p>
          <button
            type="submit"
            class="registration-manager__button"
            :disabled="instituteBusy"
          >
            {{ instituteBusy ? 'Creando…' : 'Crear institución' }}
          </button>
        </form>
      </section>
    </template>
  </main>
</template>

<style scoped>
.registration-manager__back {
  display: inline-block;
  padding: 12px 0;
  margin-bottom: 12px;
  color: #04474a;
  font-weight: 700;
}
.registration-manager {
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px 36px 48px;
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
}
.registration-manager__heading {
  margin-bottom: 24px;
}
.registration-manager h1 {
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
}
.registration-manager h2 {
  font-size: 21px;
  font-weight: 800;
  margin-bottom: 8px;
}
.registration-manager h3 {
  font-size: 18px;
  margin: 24px 0 16px;
}
.registration-manager p {
  font-size: 15px;
  line-height: 1.6;
  margin: 8px 0 16px;
}
.registration-manager__panel {
  border: 1px solid #eaf1f2;
  border-radius: 24px;
  background: #fff;
  padding: 28px;
  margin-bottom: 24px;
}
.registration-manager__note,
.registration-manager__confirmation {
  padding: 16px;
  background: #f4f8f9;
  border-radius: 16px;
}
.registration-manager__domain-form {
  display: flex;
  align-items: end;
  gap: 16px;
  margin-top: 24px;
}
.registration-manager__domain-form label {
  flex: 1;
}
.registration-manager label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  min-width: 0;
}
.registration-manager :is(input, textarea) {
  width: 100%;
  min-height: 50px;
  border: 2px solid #dbe7e9;
  border-radius: 999px;
  padding: 12px 18px;
  background: #f6fcfc;
  color: #0e2a36;
  font: inherit;
}
.registration-manager textarea {
  border-radius: 20px;
  resize: vertical;
}
.registration-manager :is(input, textarea, button, a):focus-visible {
  outline: 3px solid #065c5d;
  outline-offset: 3px;
}
.registration-manager__button,
.registration-manager__secondary {
  min-height: 50px;
  border-radius: 999px;
  padding: 12px 22px;
  background: #04474a;
  color: #fff;
  font-weight: 700;
}
.registration-manager__button:hover:not(:disabled) {
  background: #065c5d;
}
.registration-manager__secondary {
  background: #fff;
  color: #04474a;
  border: 2px solid #cfdddf;
}
.registration-manager :disabled {
  opacity: 0.6;
  cursor: wait;
}
.registration-manager__hint {
  color: #4b5f68;
  font-size: 13px !important;
}
.registration-manager__error {
  color: #8a1c1c;
}
.registration-manager__success {
  color: #065c5d;
}
.registration-manager__domains,
.registration-manager__institutions {
  list-style: none;
  padding: 0;
  margin: 20px 0 0;
}
.registration-manager__domains {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 24px;
}
.registration-manager__domains li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #eaf1f2;
  padding: 8px 0;
  overflow-wrap: anywhere;
}
.registration-manager__domains small {
  display: block;
  color: #4b5f68;
  font-size: 12px;
}
.registration-manager__text-button {
  min-height: 44px;
  padding: 8px 12px;
  color: #065c5d;
  font-weight: 700;
  border-radius: 999px;
  flex-shrink: 0;
}
.registration-manager__text-button:hover {
  background: #dbf2f4;
}
.registration-manager__confirmation {
  margin-top: 20px;
}
.registration-manager__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.registration-manager__institutions li {
  border-bottom: 1px solid #eaf1f2;
  padding: 12px 0;
  overflow-wrap: anywhere;
}
.registration-manager__institutions li > div {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.registration-manager__badge {
  padding: 4px 12px;
  border-radius: 999px;
  background: #dbf2f4;
  color: #065c5d;
  font-size: 12px;
  font-weight: 700;
}
.registration-manager__institution-form fieldset {
  border: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.registration-manager__wide {
  grid-column: 1 / -1;
}
.registration-manager__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (max-width: 720px) {
  .registration-manager {
    padding: 20px 18px 40px;
  }
  .registration-manager__panel {
    padding: 20px;
  }
  .registration-manager__domain-form {
    flex-direction: column;
    align-items: stretch;
  }
  .registration-manager__domains,
  .registration-manager__institution-form fieldset {
    grid-template-columns: 1fr;
  }
  .registration-manager__wide {
    grid-column: auto;
  }
}
</style>
