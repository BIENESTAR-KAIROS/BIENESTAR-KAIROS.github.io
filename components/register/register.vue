<script setup lang="ts">
import type { UserRegisterRequestDto } from '~/dto/request/user/user-register.request.dto'
import { UserGenderEnum } from '~/interfaces/user/enum/user-gender.enum'
import AuthShell from '../global/AuthShell.vue'
import { useUserStore } from '~/store/user'
import { required, validEmail } from '~/utils/helpers/form-rules'

const userStore = useUserStore()

const defaultRegisterData: Ref<UserRegisterRequestDto> = ref({
  name: '',
  lastName: '',
  surName: '',
  email: '',
  password: '',
  studentData: {
    age: 17,
    gender: '' as UserGenderEnum,
    groupIds: ['684fd320efc0e3279a38cc0a', '685b035d36aa0b3c141cf75a'],
  },
})

const passwordConfirm = ref('')
const isLoading = ref(false)
const submitError = ref('')
const fieldErrors = ref<Record<string, string>>({})

const genderOptions = [
  { label: 'Masculino', value: 'Masculino' },
  { label: 'Femenino', value: 'Femenino' },
  { label: 'Otro', value: 'Otro' },
]

const clearFieldError = (field: string) => {
  if (fieldErrors.value[field]) {
    fieldErrors.value = {
      ...fieldErrors.value,
      [field]: '',
    }
  }
  submitError.value = ''
}

const validateRegisterForm = () => {
  const errors: Record<string, string> = {}

  const requiredFields = [
    ['name', defaultRegisterData.value.name],
    ['lastName', defaultRegisterData.value.lastName],
    ['surName', defaultRegisterData.value.surName || ''],
    ['email', defaultRegisterData.value.email],
    ['password', defaultRegisterData.value.password],
    ['passwordConfirm', passwordConfirm.value],
    ['gender', String(defaultRegisterData.value.studentData?.gender || '')],
  ] as const

  for (const [field, value] of requiredFields) {
    const validation = required(value)
    if (validation !== true) {
      errors[field] = validation
    }
  }

  const emailValidation = validEmail(defaultRegisterData.value.email)
  if (emailValidation !== true) {
    errors.email = emailValidation
  }

  const age = Number(defaultRegisterData.value.studentData?.age)
  if (!Number.isFinite(age) || age < 12 || age > 99) {
    errors.age = 'Ingresa una edad entre 12 y 99 años'
  }

  if (
    defaultRegisterData.value.password &&
    passwordConfirm.value &&
    defaultRegisterData.value.password !== passwordConfirm.value
  ) {
    errors.passwordConfirm = 'Las contraseñas no coinciden'
  }

  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function register() {
  submitError.value = ''

  if (!validateRegisterForm()) {
    return
  }

  const nuxtApp = useNuxtApp()

  try {
    isLoading.value = true

    const response = await userStore.registerUser(defaultRegisterData.value)
    if (response.message === 'Usuario registrado correctamente') {
      nuxtApp.$Swal.fire({
        icon: 'success',
        title: 'Registro Exitoso',
        text: 'Usuario registrado correctamente. Te llegará un correo de confirmación de cuenta para poder terminar tu registro.',
      })
    } else if (
      response.message === 'El correo electrónico ya está registrado'
    ) {
      nuxtApp.$Swal.fire({
        icon: 'error',
        title: 'Error de Registro',
        text: 'El correo electrónico ya está registrado. Por favor, intenta con otro correo.',
      })
      submitError.value = response.message
      return
    } else {
      nuxtApp.$Swal.fire({
        icon: 'error',
        title: 'Error de Registro',
        text: 'Ocurrió un error al registrar el usuario. Por favor, intenta nuevamente.',
      })
      submitError.value = response.message
      return
    }

    nuxtApp.$router.push('/')
  } catch (error) {
    console.log(error)
    submitError.value = 'No pudimos completar tu registro.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthShell
    title="Crea tu acceso a Kairos."
    description="Tu registro abre un espacio privado para cuestionarios, seguimiento y acompañamiento continuo con el equipo de bienestar."
  >
    <form class="register-form" @submit.prevent="register">
      <div class="register-form__card">
        <div class="register-form__header">
          <h2>Crear cuenta</h2>
          <p>Completa tus datos para empezar.</p>
        </div>

        <div class="register-form__grid register-form__grid--double">
          <label class="register-form__field register-form__field--full">
            <span>Nombre(s)</span>
            <input
              v-model="defaultRegisterData.name"
              type="text"
              autocomplete="given-name"
              :aria-invalid="fieldErrors.name ? 'true' : 'false'"
              @input="clearFieldError('name')"
              @blur="validateRegisterForm"
            />
            <small v-if="fieldErrors.name" class="register-form__error">{{
              fieldErrors.name
            }}</small>
          </label>

          <label class="register-form__field">
            <span>Apellido paterno</span>
            <input
              v-model="defaultRegisterData.lastName"
              type="text"
              autocomplete="family-name"
              :aria-invalid="fieldErrors.lastName ? 'true' : 'false'"
              @input="clearFieldError('lastName')"
              @blur="validateRegisterForm"
            />
            <small v-if="fieldErrors.lastName" class="register-form__error">{{
              fieldErrors.lastName
            }}</small>
          </label>

          <label class="register-form__field">
            <span>Apellido materno</span>
            <input
              v-model="defaultRegisterData.surName"
              type="text"
              autocomplete="additional-name"
              :aria-invalid="fieldErrors.surName ? 'true' : 'false'"
              @input="clearFieldError('surName')"
              @blur="validateRegisterForm"
            />
            <small v-if="fieldErrors.surName" class="register-form__error">{{
              fieldErrors.surName
            }}</small>
          </label>

          <label class="register-form__field">
            <span>Edad</span>
            <input
              v-model.number="defaultRegisterData.studentData!.age"
              type="number"
              min="12"
              max="99"
              :aria-invalid="fieldErrors.age ? 'true' : 'false'"
              @input="clearFieldError('age')"
              @blur="validateRegisterForm"
            />
            <small v-if="fieldErrors.age" class="register-form__error">{{
              fieldErrors.age
            }}</small>
          </label>

          <label class="register-form__field">
            <span>Género</span>
            <select
              v-model="defaultRegisterData.studentData!.gender"
              :aria-invalid="fieldErrors.gender ? 'true' : 'false'"
              @change="clearFieldError('gender')"
              @blur="validateRegisterForm"
            >
              <option disabled value="">Selecciona una opción</option>
              <option
                v-for="option in genderOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <small v-if="fieldErrors.gender" class="register-form__error">{{
              fieldErrors.gender
            }}</small>
          </label>

          <label class="register-form__field register-form__field--full">
            <span>Correo electrónico</span>
            <input
              v-model="defaultRegisterData.email"
              type="email"
              inputmode="email"
              autocomplete="email"
              placeholder="nombre@ejemplo.com"
              :aria-invalid="fieldErrors.email ? 'true' : 'false'"
              @input="clearFieldError('email')"
              @blur="validateRegisterForm"
            />
            <small v-if="fieldErrors.email" class="register-form__error">{{
              fieldErrors.email
            }}</small>
          </label>

          <label class="register-form__field">
            <span>Contraseña</span>
            <input
              v-model="defaultRegisterData.password"
              type="password"
              autocomplete="new-password"
              :aria-invalid="fieldErrors.password ? 'true' : 'false'"
              @input="clearFieldError('password')"
              @blur="validateRegisterForm"
            />
            <small v-if="fieldErrors.password" class="register-form__error">{{
              fieldErrors.password
            }}</small>
          </label>

          <label class="register-form__field">
            <span>Confirma tu contraseña</span>
            <input
              v-model="passwordConfirm"
              type="password"
              autocomplete="new-password"
              :aria-invalid="fieldErrors.passwordConfirm ? 'true' : 'false'"
              @input="clearFieldError('passwordConfirm')"
              @blur="validateRegisterForm"
            />
            <small
              v-if="fieldErrors.passwordConfirm"
              class="register-form__error"
              >{{ fieldErrors.passwordConfirm }}</small
            >
          </label>
        </div>

        <p v-if="submitError" class="register-form__submit-error">
          {{ submitError }}
        </p>

        <button
          class="register-form__submit"
          type="submit"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Creando cuenta...' : 'Registrarme' }}
        </button>

        <NuxtLink class="register-form__back" to="/">
          ¿Ya tienes una cuenta? Inicia sesión
        </NuxtLink>
      </div>
    </form>
  </AuthShell>
</template>

<style scoped>
.register-form {
  width: 100%;
  font-family: 'Figtree', sans-serif;
}

.register-form__card {
  width: min(100%, 560px);
  margin: 0 auto;
  padding: 36px;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 18px 40px -20px rgba(6, 92, 93, 0.4);
}

.register-form__header {
  margin-bottom: 20px;
}

.register-form__header h2 {
  margin: 0;
  color: rgb(14, 42, 54);
  font-size: 1.625rem;
  font-weight: 800;
  line-height: 1.1;
}

.register-form__header p {
  margin: 8px 0 0;
  color: rgb(92, 112, 120);
  font-size: 0.875rem;
  line-height: 1.5;
}

.register-form__grid {
  display: grid;
  gap: 14px;
}

.register-form__grid--double {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.register-form__field {
  display: block;
}

.register-form__field--full {
  grid-column: 1 / -1;
}

.register-form__field span {
  display: block;
  margin-bottom: 8px;
  color: rgb(14, 42, 54);
  font-size: 1rem;
}

.register-form__field input,
.register-form__field select {
  width: 100%;
  height: 50px;
  padding: 0 20px;
  border: 2px solid rgb(219, 242, 244);
  border-radius: 999px;
  background: rgb(246, 252, 252);
  color: rgb(14, 42, 54);
  font-size: 0.9375rem;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.register-form__field select {
  appearance: none;
}

.register-form__field input:focus,
.register-form__field select:focus {
  border-color: rgb(108, 197, 203);
  box-shadow: 0 0 0 4px rgba(108, 197, 203, 0.16);
  background: #fff;
}

.register-form__field input[aria-invalid='true'],
.register-form__field select[aria-invalid='true'] {
  border-color: #c84b5d;
}

.register-form__error,
.register-form__submit-error {
  display: block;
  margin-top: 8px;
  color: #c84b5d;
  font-size: 0.8125rem;
  line-height: 1.4;
}

.register-form__submit {
  width: 100%;
  min-height: 50px;
  margin-top: 18px;
  border: 0;
  border-radius: 999px;
  background: rgb(6, 92, 93);
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px -16px rgba(6, 92, 93, 0.7);
}

.register-form__submit:disabled {
  cursor: wait;
  opacity: 0.8;
}

.register-form__back {
  display: inline-flex;
  justify-content: center;
  width: 100%;
  margin-top: 16px;
  color: rgb(7, 151, 159);
  font-size: 0.9375rem;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 720px) {
  .register-form__card {
    width: 100%;
    padding: 28px 24px;
  }

  .register-form__grid--double {
    grid-template-columns: 1fr;
  }

  .register-form__field--full {
    grid-column: auto;
  }
}
</style>
