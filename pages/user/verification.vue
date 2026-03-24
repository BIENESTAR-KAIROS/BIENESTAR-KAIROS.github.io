<script lang="tsx" setup>
definePageMeta({
  layout: 'empty-login',
})

onMounted(async () => {
  const route = useRoute()
  const token = route.query.token as string | undefined

  const success = ref(false)
  const { $axios, $Swal, $router } = useNuxtApp()

  try {
    if (!token) {
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
      $Swal.fire('Cuenta verificada con éxito. Ahora puedes iniciar sesión.')
      success.value = true

      $router.push('/user/login')
    } else {
      throw new Error('No se pudo verificar la cuenta.')
    }
  } catch (error) {
    console.log(error)
    $Swal.fire('Error al verificar la cuenta.')
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
          <v-card-text class="text-center mb-4">
            Estamos verificando tu cuenta. Espera un momento por favor...
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
