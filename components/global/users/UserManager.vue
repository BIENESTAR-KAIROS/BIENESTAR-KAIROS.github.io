<script setup lang="ts">
import { useId } from 'vue'
import type { AdminUser } from '~/interfaces/user/admin-user.interface'
import type {
  ManagedUserPayload,
  ManagedUserResponse,
} from '~/interfaces/user/managed-user.interface'
import type { RegistrationInstitute } from '~/interfaces/institution/registration-institute.interface'
import { getApiErrorMessage } from '~/utils/helpers/http-errors'
const props = defineProps<{
  userId?: string
  institutionId?: string
  institutions?: RegistrationInstitute[]
}>()
const emit = defineEmits<{ changed: [] }>()
const { $axios } = useNuxtApp()
const dialogTitleId = useId()
const open = ref(false)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const feedback = ref('')
const record = ref<AdminUser | null>(null)
const statusConfirmation = ref(false)
const saved = ref(false)
const form = reactive({
  name: '',
  lastName: '',
  surName: '',
  email: '',
  password: '',
  age: '',
  gender: '',
  campus: '',
  roles: ['STUDENT'],
  institutionId: '',
})
const base = computed(() =>
  props.institutionId
    ? `/institute/${props.institutionId}/managed-users`
    : '/admin/managed-users',
)
const roleOptions = [
  { value: 'STUDENT', label: 'Alumno' },
  { value: 'INSTITUTION_STAFF', label: 'Personal institucional' },
  { value: 'INSTITUTION_ADMIN', label: 'Administrador institucional' },
  { value: 'KAIROS_ADMIN', label: 'Administrador KAIROS' },
]
const emailChanged = computed(() =>
  Boolean(
    record.value && form.email.trim().toLowerCase() !== record.value.email,
  ),
)
const willSendEmail = computed(() => !props.userId || emailChanged.value)
async function launch() {
  open.value = true
  loading.value = true
  error.value = ''
  feedback.value = ''
  saved.value = false
  record.value = null
  statusConfirmation.value = false
  Object.assign(form, {
    name: '',
    lastName: '',
    surName: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    campus: '',
    roles: ['STUDENT'],
    institutionId: '',
  })
  try {
    if (props.userId) {
      const { data } = await $axios.get<AdminUser>(
        `${base.value}/${props.userId}`,
      )
      record.value = data
      Object.assign(form, {
        name: data.name,
        lastName: data.lastName,
        surName: data.surName ?? '',
        email: data.email,
        age: data.studentData?.age?.toString() ?? '',
        gender: data.studentData?.gender?.split('.').pop()?.toLowerCase() ?? '',
        campus: data.studentData?.campusInformation?.name ?? '',
        roles: [...data.roles],
        institutionId: data.institute ?? '',
      })
    }
  } catch (cause) {
    error.value = getApiErrorMessage(cause, 'No pudimos cargar la cuenta.')
  } finally {
    loading.value = false
  }
}
function notifyEmail(result: ManagedUserResponse, fallback: string) {
  feedback.value =
    result.verificationEmail === 'accepted'
      ? `${fallback} El servidor de correo aceptó el envío de verificación. El usuario debe verificarlo antes de entrar.`
      : result.verificationEmail === 'failed'
        ? `${fallback} No se pudo confirmar el envío de verificación. La cuenta sigue sin verificar; contacta al equipo de KAIROS antes de intentar crearla de nuevo.`
        : fallback
}
async function save() {
  error.value = ''
  if (!form.name.trim() || !form.lastName.trim()) {
    error.value = 'Completa el nombre y el primer apellido.'
    return
  }
  if (!props.institutionId && !record.value?.isDemo && !form.roles.length) {
    error.value = 'Selecciona al menos un rol.'
    return
  }
  saving.value = true
  try {
    const body: ManagedUserPayload = {
      name: form.name.trim(),
      lastName: form.lastName.trim(),
      surName: form.surName.trim(),
      campus: form.campus.trim(),
    }
    if (form.age !== '') body.age = Number(form.age)
    if (form.gender) body.gender = form.gender
    if (willSendEmail.value) body.email = form.email.trim().toLowerCase()
    if (!props.userId) body.password = form.password
    if (!props.institutionId && !record.value?.isDemo) {
      body.roles = form.roles
      // Blank on creation follows the registration domain's institution.
      if (form.institutionId || props.userId)
        body.institutionId = form.institutionId || null
    }
    const response = props.userId
      ? await $axios.patch<ManagedUserResponse>(
          `${base.value}/${props.userId}`,
          body,
        )
      : await $axios.post<ManagedUserResponse>(base.value, body)
    form.password = ''
    saved.value = true
    notifyEmail(
      response.data,
      props.userId ? 'Cambios guardados.' : 'Cuenta creada.',
    )
  } catch (cause) {
    error.value = getApiErrorMessage(
      cause,
      'No pudimos guardar la cuenta. Revisa los campos e inténtalo de nuevo.',
    )
  } finally {
    saving.value = false
  }
}
async function changeStatus() {
  if (!record.value) return
  saving.value = true
  error.value = ''
  try {
    await $axios.patch(`${base.value}/${props.userId}/status`, {
      active: !record.value.active,
    })
    saved.value = true
    feedback.value = record.value.active
      ? 'Cuenta desactivada. Su historial se conserva y ya no puede iniciar sesión.'
      : 'Cuenta reactivada. Para entrar, su correo debe estar verificado.'
  } catch (cause) {
    error.value = getApiErrorMessage(
      cause,
      'No pudimos cambiar el estado de la cuenta.',
    )
  } finally {
    saving.value = false
  }
}
watch(open, (value) => {
  if (!value) {
    form.password = ''
    if (saved.value) emit('changed')
  }
})
</script>

<template>
  <span
    class="user-management"
    :class="{ 'user-management--institution': institutionId }"
    @click.stop
    @keydown.enter.stop
  >
    <button
      type="button"
      class="management-trigger"
      :aria-label="userId ? 'Gestionar usuario' : 'Añadir usuario'"
      @click="launch"
    >
      {{ userId ? 'Gestionar' : 'Añadir usuario' }}
    </button>
    <v-dialog
      v-model="open"
      :persistent="saving"
      max-width="680"
      :aria-labelledby="dialogTitleId"
    >
      <section
        class="management-dialog"
        :class="{ 'management-dialog--institution': institutionId }"
        :aria-busy="saving || loading"
      >
        <header>
          <div>
            <p class="management-eyebrow">
              {{
                institutionId
                  ? 'Usuarios de tu institución'
                  : 'Administración KAIROS'
              }}
            </p>
            <h2 :id="dialogTitleId">
              {{ userId ? 'Gestionar usuario' : 'Añadir usuario' }}
            </h2>
          </div>
          <button
            type="button"
            :disabled="saving"
            aria-label="Cerrar gestión de usuario"
            @click="open = false"
          >
            Cerrar
          </button>
        </header>
        <p v-if="loading" role="status">Cargando cuenta…</p>
        <p v-if="error" class="management-error" role="alert">{{ error }}</p>
        <div v-if="saved" role="status">
          <p>{{ feedback }}</p>
          <button
            type="button"
            class="management-primary"
            @click="open = false"
          >
            Volver al listado
          </button>
        </div>
        <template v-else-if="!loading && (!userId || record)">
          <template v-if="statusConfirmation && record">
            <h3>
              {{ record.active ? 'Desactivar' : 'Reactivar' }} a
              {{ record.name }} {{ record.lastName }}
            </h3>
            <p>
              {{
                record.active
                  ? 'Se bloqueará el acceso a la aplicación. Sus respuestas, resultados y recomendaciones se conservarán. Podrás reactivar la cuenta después.'
                  : 'La cuenta volverá a estar activa. Solo podrá entrar si ya verificó su correo.'
              }}
            </p>
            <p v-if="record.isDemo">
              Este cambio afecta a la cuenta demo en todas las instituciones que
              la comparten.
            </p>
            <div class="management-actions">
              <button
                :disabled="saving"
                type="button"
                @click="statusConfirmation = false"
              >
                Cancelar</button
              ><button
                :disabled="saving"
                class="management-primary"
                type="button"
                @click="changeStatus"
              >
                {{
                  saving
                    ? 'Guardando…'
                    : record.active
                      ? 'Confirmar desactivación'
                      : 'Confirmar reactivación'
                }}
              </button>
            </div>
          </template>
          <form v-else @submit.prevent="save">
            <p v-if="record">
              {{ record.isDemo ? 'Cuenta demo · ' : ''
              }}{{ record.active ? 'Activa' : 'Desactivada' }} ·
              {{
                record.isVerificated
                  ? 'Correo verificado'
                  : 'Correo sin verificar'
              }}
            </p>
            <p v-if="record?.isDemo">
              Los cambios en este perfil demo se reflejan en todas las
              instituciones que lo comparten. Sus asignaciones se gestionan
              desde el bloque de demos.
            </p>
            <div class="management-fields">
              <label
                >Nombre<input
                  v-model="form.name"
                  required
                  maxlength="100"
                  autocomplete="off"
                  :disabled="saving"
              /></label>
              <label
                >Primer apellido<input
                  v-model="form.lastName"
                  required
                  maxlength="100"
                  autocomplete="off"
                  :disabled="saving"
              /></label>
              <label
                >Segundo apellido<input
                  v-model="form.surName"
                  maxlength="100"
                  autocomplete="off"
                  :disabled="saving"
              /></label>
              <label
                >Correo<input
                  v-model="form.email"
                  :type="record && !emailChanged ? 'text' : 'email'"
                  required
                  maxlength="254"
                  autocomplete="off"
                  :disabled="saving"
              /></label>
              <label v-if="!userId"
                >Contraseña inicial<input
                  v-model="form.password"
                  type="password"
                  required
                  minlength="8"
                  maxlength="128"
                  autocomplete="new-password"
                  :disabled="saving"
                /><small
                  >Mínimo 8 caracteres. Compártela de forma segura con el
                  usuario.</small
                ></label
              >
              <label
                >Edad<input
                  v-model="form.age"
                  :required="!userId"
                  type="number"
                  min="0"
                  max="120"
                  step="1"
                  :disabled="saving"
              /></label>
              <label
                >Género<select
                  v-model="form.gender"
                  :required="!userId"
                  :disabled="saving"
                >
                  <option value="" disabled>Sin registro</option>
                  <option value="female">Femenino</option>
                  <option value="male">Masculino</option>
                  <option value="other">Otro</option>
                </select></label
              >
              <label
                >Campus<input
                  v-model="form.campus"
                  maxlength="150"
                  :disabled="saving"
              /></label>
              <label v-if="!institutionId && !record?.isDemo"
                >Institución<select
                  v-model="form.institutionId"
                  :disabled="saving"
                >
                  <option value="">
                    {{
                      userId
                        ? 'Sin institución (solo KAIROS)'
                        : 'Asignar según el dominio del correo'
                    }}
                  </option>
                  <option
                    v-for="institution in institutions"
                    :key="institution._id"
                    :value="institution._id"
                  >
                    {{ institution.name }}
                  </option>
                </select></label
              >
            </div>
            <fieldset
              v-if="!institutionId && !record?.isDemo"
              :disabled="saving"
            >
              <legend>Roles</legend>
              <label
                v-for="role in roleOptions"
                :key="role.value"
                class="management-checkbox"
                ><input
                  v-model="form.roles"
                  type="checkbox"
                  :value="role.value"
                />{{ role.label }}</label
              >
              <p>
                Los correos @siatsa.com reciben el rol de administrador KAIROS
                al verificarse.
              </p>
            </fieldset>
            <p v-if="!userId && institutionId">
              Se creará como alumno de esta institución.
            </p>
            <p v-if="willSendEmail" class="management-notice">
              Al guardar se enviará un correo de verificación a
              {{ form.email || 'la dirección indicada' }}. El usuario deberá
              verificarlo antes de entrar{{
                emailChanged
                  ? ' y sus sesiones actuales dejarán de funcionar'
                  : ''
              }}.
            </p>
            <div class="management-actions">
              <button
                v-if="record"
                type="button"
                class="management-status"
                :disabled="saving"
                @click="statusConfirmation = true"
              >
                {{
                  record.active ? 'Desactivar cuenta' : 'Reactivar cuenta'
                }}</button
              ><button
                type="submit"
                class="management-primary"
                :disabled="saving"
              >
                {{
                  saving
                    ? 'Guardando…'
                    : willSendEmail
                      ? 'Guardar y enviar verificación'
                      : 'Guardar cambios'
                }}
              </button>
            </div>
          </form>
        </template>
      </section>
    </v-dialog>
  </span>
</template>

<style scoped>
.user-management,
.management-dialog {
  --management-color: #04474a;
}
.user-management--institution,
.management-dialog--institution {
  --management-color: #3c2f52;
}
.management-trigger,
.management-dialog button {
  min-height: 44px;
  padding: 10px 18px;
  border: 1px solid var(--management-color);
  border-radius: 999px;
  font: inherit;
  font-weight: 700;
  color: var(--management-color);
  background: white;
  cursor: pointer;
}
.management-trigger {
  white-space: nowrap;
}
.management-dialog {
  font-family: Figtree, sans-serif;
  color: var(--management-color);
  background: white;
  border-radius: 24px;
  padding: 28px;
  max-height: 85dvh;
  overflow-y: auto;
  line-height: 1.5;
}
.management-dialog header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
.management-dialog h2 {
  font-size: 24px;
}
.management-dialog p {
  margin: 12px 0;
}
.management-dialog .management-eyebrow {
  margin: 0;
  font-size: 13px;
}
.management-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 20px 0;
}
.management-fields label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
}
.management-fields input,
.management-fields select {
  min-width: 0;
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid #b5c6c8;
  border-radius: 10px;
  background: white;
  color: #243c43;
  font: inherit;
}
.management-dialog fieldset {
  border: 1px solid #b5c6c8;
  border-radius: 12px;
  padding: 12px 16px;
}
.management-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
}
.management-checkbox input {
  width: 20px;
  height: 20px;
  accent-color: var(--management-color);
}
.management-notice {
  padding: 16px;
  border-radius: 12px;
  background: #eef5f5;
}
.management-dialog--institution .management-notice {
  background: #f0eaf5;
}
.management-error {
  color: #8a1c1c;
  background: #fdecec;
  padding: 12px;
  border-radius: 10px;
}
.management-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}
.management-dialog .management-primary {
  background: var(--management-color);
  color: white;
}
.management-dialog .management-status {
  margin-right: auto;
}
.management-dialog button:disabled,
.management-dialog input:disabled,
.management-dialog select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.management-dialog :focus-visible,
.management-trigger:focus-visible {
  outline: 3px solid var(--management-color);
  outline-offset: 3px;
}
@media (max-width: 600px) {
  .management-fields {
    grid-template-columns: 1fr;
  }
  .management-dialog {
    padding: 20px;
  }
  .management-actions button {
    width: 100%;
  }
}
</style>
