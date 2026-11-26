<script setup lang="ts">
import { isAxiosError } from 'axios'
import type { RegistrationInstitute } from '~/interfaces/institution/registration-institute.interface'
import type {
  InstitutionalRole,
  RegistrationGrant,
} from '~/interfaces/institution/registration-grant.interface'
import { UserRolEnum } from '~/interfaces/user/enum/user-rol.enum'
import { institutionTerms } from '~/utils/helpers/institution-structure'
import { getApiErrorMessage } from '~/utils/helpers/http-errors'

const props = defineProps<{ institution: RegistrationInstitute }>()
const { $axios } = useNuxtApp()
const title = useId()
const open = ref(false)
const busy = ref(false)
const loaded = ref(false)
const rows = ref<RegistrationGrant[]>([])
const email = ref('')
const role = ref<InstitutionalRole>(UserRolEnum.STUDENT)
const error = ref('')
const status = ref('')
const existingUser = ref('')
const base = computed(
  () => `/admin/institutions/${props.institution._id}/registration-grants`,
)
const labels = computed(() => ({
  STUDENT: institutionTerms(props.institution.institutionType).member,
  INSTITUTION_STAFF: 'Personal institucional',
  INSTITUTION_ADMIN: 'Administrador institucional',
}))

async function load() {
  busy.value = true
  loaded.value = false
  error.value = ''
  try {
    rows.value = (await $axios.get<RegistrationGrant[]>(base.value)).data
    loaded.value = true
  } catch (cause) {
    error.value = getApiErrorMessage(
      cause,
      'No pudimos cargar los accesos pendientes.',
    )
  } finally {
    busy.value = false
  }
}
watch(open, (value) => {
  if (value) {
    email.value = ''
    role.value = UserRolEnum.STUDENT
    existingUser.value = ''
    status.value = ''
    load()
  }
})
function edit(row: RegistrationGrant) {
  email.value = row._id
  role.value = row.role
}
async function update(cancelEmail?: string) {
  if (busy.value) return
  busy.value = true
  existingUser.value = ''
  status.value = ''
  error.value = ''
  try {
    if (cancelEmail) {
      await $axios.post(base.value + '/cancel', { email: cancelEmail })
      status.value = 'Acceso pendiente cancelado.'
    } else {
      await $axios.post(base.value, {
        email: email.value.trim(),
        role: role.value,
      })
      status.value =
        'Acceso guardado. Se aplicará cuando la persona verifique su correo.'
    }
    email.value = ''
    role.value = UserRolEnum.STUDENT
    await load()
  } catch (cause) {
    error.value = getApiErrorMessage(cause, 'No pudimos guardar el cambio.')
    if (isAxiosError<{ userId?: string }>(cause))
      existingUser.value = cause.response?.data?.userId ?? ''
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <v-dialog
    v-model="open"
    max-width="600"
    :aria-labelledby="title"
    :persistent="busy"
  >
    <template #activator="{ props: activator }">
      <button
        type="button"
        class="grant-button"
        v-bind="activator"
        :aria-label="`Accesos por correo de ${institution.name}`"
      >
        Accesos por correo
      </button>
    </template>
    <section class="grant-panel" :aria-busy="busy">
      <h2 :id="title">Accesos por correo · {{ institution.name }}</h2>
      <p>El rol se aplicará al verificar el correo indicado.</p>
      <p v-if="error" role="alert">
        {{ error }}
        <NuxtLink v-if="existingUser" :to="`/admin/users/${existingUser}`"
          >Abrir perfil</NuxtLink
        >
      </p>
      <button
        v-if="!loaded && !busy"
        type="button"
        class="grant-button"
        @click="load"
      >
        Volver a intentar
      </button>
      <p v-if="status" role="status">{{ status }}</p>
      <template v-if="loaded">
        <form @submit.prevent="update()">
          <label
            >Correo electrónico<input
              v-model="email"
              type="email"
              maxlength="254"
              required
              :disabled="busy || !institution.active"
          /></label>
          <label
            >Rol al registrarse<select
              v-model="role"
              :disabled="busy || !institution.active"
            >
              <option
                v-for="(label, value) in labels"
                :key="value"
                :value="value"
              >
                {{ label }}
              </option>
            </select></label
          >
          <button class="grant-button" :disabled="busy || !institution.active">
            Guardar acceso
          </button>
        </form>
        <h3>Accesos pendientes</h3>
        <p v-if="!rows.length">Aún no hay correos pendientes.</p>
        <ul v-else>
          <li v-for="row in rows" :key="row._id">
            <span>{{ row._id }} · {{ labels[row.role] }}</span>
            <button
              type="button"
              class="grant-button"
              :disabled="busy"
              :aria-label="`Editar acceso de ${row._id}`"
              @click="edit(row)"
            >
              Editar
            </button>
            <button
              type="button"
              class="grant-button"
              :disabled="busy"
              :aria-label="`Cancelar acceso de ${row._id}`"
              @click="update(row._id)"
            >
              Cancelar acceso
            </button>
          </li>
        </ul>
      </template>
      <p v-else-if="busy" role="status">Cargando accesos…</p>
      <button
        type="button"
        class="grant-button"
        :disabled="busy"
        @click="open = false"
      >
        Cerrar
      </button>
    </section>
  </v-dialog>
</template>

<style scoped>
.grant-panel {
  background: white;
  border-radius: 20px;
  padding: clamp(16px, 4vw, 32px);
  overflow-y: auto;
  color: #0e2a36;
  font-family: Figtree, sans-serif;
}
.grant-panel form,
.grant-panel label {
  display: grid;
  gap: 8px;
}
.grant-panel form {
  gap: 16px;
  margin-block: 16px;
}
.grant-panel input,
.grant-panel select,
.grant-button {
  min-height: 44px;
  background: white;
  border: 1px solid #446265;
  padding: 8px 14px;
  border-radius: 12px;
  color: #04474a;
}
.grant-button {
  border-radius: 999px;
  font-weight: 700;
}
.grant-panel ul {
  padding: 0;
  list-style: none;
}
.grant-panel li {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}
.grant-panel li span {
  flex-basis: 100%;
  overflow-wrap: anywhere;
}
.grant-panel :focus-visible,
.grant-button:focus-visible {
  outline: 3px solid #04474a;
  outline-offset: 2px;
}
.grant-panel :disabled {
  opacity: 0.55;
}
</style>
