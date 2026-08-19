<script setup lang="ts">
import type { ILoginResponse } from '~/interfaces/login/login-response.interface'
import { UserRolEnum } from '~/interfaces/user/enum/user-rol.enum'
import { useAuthStore } from '~/store/auth'
import { useUserStore } from '~/store/user'
import { required, validEmail } from '~/utils/helpers/form-rules'

const { $axios, $router } = useNuxtApp()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const emailError = ref('')
const passwordError = ref('')
const submitError = ref('')

const authStore = useAuthStore()
const userStore = useUserStore()

const validateForm = () => {
  const emailValidation = required(email.value)
  const emailFormatValidation = validEmail(email.value)
  const passwordValidation = required(password.value)

  emailError.value =
    emailValidation !== true
      ? emailValidation
      : emailFormatValidation !== true
        ? emailFormatValidation
        : ''

  passwordError.value = passwordValidation !== true ? passwordValidation : ''

  return !emailError.value && !passwordError.value
}

const clearSubmitError = () => {
  submitError.value = ''
}

const clearEmailError = () => {
  emailError.value = ''
  clearSubmitError()
}

const clearPasswordError = () => {
  passwordError.value = ''
  clearSubmitError()
}

const login = async () => {
  clearSubmitError()

  if (!validateForm()) {
    return
  }

  try {
    isLoading.value = true
    const { data: session } = await $axios.post<ILoginResponse>('/auth/login', {
      email: email.value,
      password: password.value,
    })

    await authStore.setAuth(session)

    if (authStore.isAuthenticated) {
      userStore.user = authStore.user
      if (
        authStore.user?.roles[1] == UserRolEnum.INSTITUTION_ADMIN ||
        authStore.user?.roles[2] == UserRolEnum.INSTITUTION_STAFF
      ) {
        $router.push('/institute/dashboard')
      } else {
        $router.push('/user/dashboard')
      }
    }
  } catch (error) {
    console.log(error)
    submitError.value = 'No pudimos iniciar sesión con esos datos.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form class="login-form" @submit.prevent="login">
    <div class="login-form__card">
      <div class="login-form__header">
        <h2>¡Qué gusto verte!</h2>
        <p>Entra con tu correo institucional.</p>
      </div>

      <label class="login-form__field">
        <span>Correo</span>
        <input
          v-model="email"
          type="email"
          inputmode="email"
          autocomplete="email"
          placeholder="nombre@ejemplo.com"
          :aria-invalid="emailError ? 'true' : 'false'"
          @input="clearEmailError"
          @blur="validateForm"
        />
        <small v-if="emailError" class="login-form__error">{{
          emailError
        }}</small>
      </label>

      <label class="login-form__field">
        <span>Contraseña</span>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          :aria-invalid="passwordError ? 'true' : 'false'"
          @input="clearPasswordError"
          @blur="validateForm"
        />
        <small v-if="passwordError" class="login-form__error">{{
          passwordError
        }}</small>
      </label>

      <div class="login-form__actions">
        <NuxtLink class="login-form__forgot" to="/forgot-password">
          ¿Olvidaste tu contraseña?
        </NuxtLink>

        <p v-if="submitError" class="login-form__submit-error">
          {{ submitError }}
        </p>

        <button class="login-form__submit" type="submit" :disabled="isLoading">
          {{ isLoading ? 'Entrando...' : 'Iniciar sesión' }}
        </button>
      </div>

      <div class="login-form__divider" aria-hidden="true">
        <span></span>
        <strong>ó</strong>
        <span></span>
      </div>

      <NuxtLink class="login-form__register" to="/register">
        Crear cuenta
      </NuxtLink>
    </div>
  </form>
</template>

<style scoped>
.login-form {
  width: 100%;
  font-family: 'Figtree', sans-serif;
}

.login-form__card {
  width: min(100%, 420px);
  margin: 0 auto;
  padding: 36px;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 18px 40px -20px rgba(6, 92, 93, 0.4);
}

.login-form__header {
  margin-bottom: 18px;
}

.login-form__header h2 {
  margin: 0;
  color: rgb(14, 42, 54);
  font-size: 1.625rem;
  font-weight: 800;
  line-height: 1.1;
}

.login-form__header p {
  margin: 8px 0 0;
  color: rgb(92, 112, 120);
  font-size: 0.875rem;
  line-height: 1.5;
}

.login-form__field {
  display: block;
  margin-bottom: 14px;
}

.login-form__field span {
  display: block;
  margin-bottom: 8px;
  color: rgb(14, 42, 54);
  font-size: 1rem;
  font-weight: 400;
}

.login-form__field input {
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

.login-form__field input::placeholder {
  color: rgba(92, 112, 120, 0.76);
}

.login-form__field input:focus {
  border-color: rgb(108, 197, 203);
  box-shadow: 0 0 0 4px rgba(108, 197, 203, 0.16);
  background: #fff;
}

.login-form__field input[aria-invalid='true'] {
  border-color: #c84b5d;
}

.login-form__error,
.login-form__submit-error {
  display: block;
  margin-top: 8px;
  color: #c84b5d;
  font-size: 0.8125rem;
  line-height: 1.4;
}

.login-form__actions {
  margin-top: 8px;
}

.login-form__forgot {
  display: block;
  margin-bottom: 14px;
  color: rgb(7, 151, 159);
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1.3;
  text-align: right;
  text-decoration: none;
}

.login-form__submit,
.login-form__register {
  width: 100%;
  min-height: 50px;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.login-form__submit {
  border: 0;
  background: rgb(6, 92, 93);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 12px 24px -16px rgba(6, 92, 93, 0.7);
}

.login-form__submit:disabled {
  cursor: wait;
  opacity: 0.8;
}

.login-form__register {
  border: 2px solid rgb(108, 197, 203);
  background: #fff;
  color: rgb(6, 92, 93);
}

.login-form__submit:hover:not(:disabled),
.login-form__register:hover {
  transform: translateY(-1px);
}

.login-form__divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
}

.login-form__divider span {
  flex: 1;
  height: 1px;
  background: rgba(14, 42, 54, 0.16);
}

.login-form__divider strong {
  color: rgb(107, 129, 137);
  font-size: 0.75rem;
  font-weight: 700;
}

@media (max-width: 600px) {
  .login-form__card {
    width: 100%;
    padding: 28px 24px;
  }
}
</style>
