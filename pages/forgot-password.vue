<script setup lang="ts">
import AuthShell from '~/components/global/AuthShell.vue'
import { required, validEmail } from '~/utils/helpers/form-rules'

definePageMeta({
  layout: 'empty-login',
})

const { $axios } = useNuxtApp()
const email = ref('')
const isLoading = ref(false)
const emailError = ref('')
const submitError = ref('')
const successMessage = ref('')

const validateForm = () => {
  const requiredValidation = required(email.value)
  const emailValidation = validEmail(email.value)

  emailError.value =
    requiredValidation !== true
      ? requiredValidation
      : emailValidation !== true
        ? emailValidation
        : ''

  return !emailError.value
}

const clearEmailError = () => {
  emailError.value = ''
  submitError.value = ''
  successMessage.value = ''
}

const sendRecoveryEmail = async () => {
  submitError.value = ''
  successMessage.value = ''

  if (!validateForm()) {
    return
  }

  try {
    isLoading.value = true
    const response = await $axios.post<{ success: boolean }>(
      '/auth/forgot-password',
      {
        email: email.value,
      },
    )

    if (response.data.success)
      successMessage.value =
        'Correo de recuperación enviado. Revisa tu bandeja de entrada y la carpeta de spam.'
    else throw new Error('No se pudo enviar el correo de recuperación.')
  } catch (error) {
    console.log(error)
    submitError.value = 'Error al enviar el correo de recuperación.'
  } finally {
    isLoading.value = false
  }
}
</script>
<template>
  <AuthShell
    title="Recupera el acceso a tu cuenta."
    description="Si olvidaste tu contraseña, te enviaremos un enlace para crear una nueva sin perder el seguimiento de tu proceso."
  >
    <form class="forgot-form" @submit.prevent="sendRecoveryEmail">
      <div class="forgot-form__card">
        <div class="forgot-form__header">
          <h2>¿Olvidaste tu contraseña?</h2>
          <p>
            Ingresa el correo con el que te registraste y te enviaremos las
            instrucciones para restablecerla.
          </p>
        </div>

        <label class="forgot-form__field">
          <span>Correo electrónico</span>
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
          <small v-if="emailError" class="forgot-form__error">{{
            emailError
          }}</small>
        </label>

        <p v-if="successMessage" class="forgot-form__success">
          {{ successMessage }}
        </p>

        <p
          v-if="submitError"
          class="forgot-form__error forgot-form__error--submit"
        >
          {{ submitError }}
        </p>

        <button class="forgot-form__submit" type="submit" :disabled="isLoading">
          {{ isLoading ? 'Enviando...' : 'Enviar correo de recuperación' }}
        </button>

        <NuxtLink class="forgot-form__back" to="/">
          Prefiero iniciar sesión
        </NuxtLink>
      </div>
    </form>
  </AuthShell>
</template>

<style scoped>
.forgot-form {
  width: 100%;
  font-family: 'Figtree', sans-serif;
}

.forgot-form__card {
  width: min(100%, 420px);
  margin: 0 auto;
  padding: 36px;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 18px 40px -20px rgba(6, 92, 93, 0.4);
}

.forgot-form__header {
  margin-bottom: 20px;
}

.forgot-form__header h2 {
  margin: 0;
  color: rgb(14, 42, 54);
  font-size: 1.625rem;
  font-weight: 800;
  line-height: 1.1;
}

.forgot-form__header p {
  margin: 8px 0 0;
  color: rgb(92, 112, 120);
  font-size: 0.875rem;
  line-height: 1.5;
}

.forgot-form__field {
  display: block;
}

.forgot-form__field span {
  display: block;
  margin-bottom: 8px;
  color: rgb(14, 42, 54);
  font-size: 1rem;
}

.forgot-form__field input {
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

.forgot-form__field input:focus {
  border-color: rgb(108, 197, 203);
  box-shadow: 0 0 0 4px rgba(108, 197, 203, 0.16);
  background: #fff;
}

.forgot-form__field input[aria-invalid='true'] {
  border-color: #c84b5d;
}

.forgot-form__error,
.forgot-form__success {
  margin: 14px 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.forgot-form__error {
  color: #c84b5d;
}

.forgot-form__success {
  color: rgb(6, 92, 93);
}

.forgot-form__submit {
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

.forgot-form__submit:disabled {
  cursor: wait;
  opacity: 0.8;
}

.forgot-form__back {
  display: inline-flex;
  justify-content: center;
  width: 100%;
  margin-top: 16px;
  color: rgb(7, 151, 159);
  font-size: 0.9375rem;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 600px) {
  .forgot-form__card {
    width: 100%;
    padding: 28px 24px;
  }
}
</style>
