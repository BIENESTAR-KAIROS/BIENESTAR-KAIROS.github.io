<script lang="tsx" setup>
import { getApiErrorMessage } from '~/utils/helpers/http-errors'

const verificationMessage = ref(
  'Estamos verificando tu cuenta. Espera un momento por favor...',
)
const verificationFailed = ref(false)
definePageMeta({
  layout: 'empty-login',
})

onMounted(async () => {
  const route = useRoute()
  const token = route.query.token as string | undefined

  const { $axios, $Swal, $router } = useNuxtApp()

  try {
    if (!token) {
      verificationFailed.value = true
      verificationMessage.value =
        'Abre el enlace que enviamos a tu correo para confirmar tu cuenta.'
      $Swal.fire(
        'Token de verificación no proporcionado. Verifica tu correo para obtener el enlace correcto.',
      )

      return
    }

    const response = await $axios.post<{ success: boolean }>(
      '/user/verify-user',
      {
        token: token,
      },
    )

    if (response.data.success) {
      verificationMessage.value =
        'Cuenta verificada con éxito. Ahora puedes iniciar sesión.'
      await $Swal.fire(verificationMessage.value)

      $router.push('/')
    } else {
      throw new Error('No se pudo verificar la cuenta.')
    }
  } catch (error) {
    verificationFailed.value = true
    verificationMessage.value = getApiErrorMessage(
      error,
      'No pudimos verificar la cuenta. El enlace puede ser inválido o ya haberse utilizado.',
    )
    $Swal.fire(verificationMessage.value)
  }
})
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <v-card class="pa-5 rounded-xxl" outlined elevation="5">
          <v-card-title class="text-h4 text-center mb-2">
            Verificación de Usuario
          </v-card-title>
          <v-card-text
            class="text-center mb-4"
            :role="verificationFailed ? 'alert' : 'status'"
          >
            {{ verificationMessage }}
            <NuxtLink v-if="verificationFailed" to="/" class="d-block mt-4"
              >Volver al inicio de sesión</NuxtLink
            >
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
