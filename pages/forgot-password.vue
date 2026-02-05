<script setup lang="ts">
definePageMeta({
  layout: 'empty-login',
})

const { $axios } = useNuxtApp()
const email = ref('')

const sendRecoveryEmail = async () => {
  try {
    const response = await $axios.post<{ success: boolean }>(
      '/auth/forgot-password',
      {
        email: email.value,
      },
    )

    if (response.data.success)
      alert(
        'Correo de recuperación enviado. Por favor revisa tu bandeja de entrada.',
      )
    else throw new Error('No se pudo enviar el correo de recuperación.')
  } catch (error) {
    console.log(error)
    alert('Error al enviar el correo de recuperación.')
  }
}
</script>
<template>
  <v-container>
    <v-row>
      <v-col>
        <div class="my-4">
          <h1 class="handlee-regular text-h2 font-weight-thin">
            ¿Has olvidado tu contraseña?
          </h1>
        </div>
        <br />
        <p class="catamaran-regular">
          No te preocupes, a todos nos puede pasar. Solo ten en mente que
          tendremos que hacer un reset del password que tenías anteriormente.
          <br /><br /><br />
          Para eso, por favor ayudanos proporcionando de nuevo la información
          del correo electrónico que habías registrado previamente.
          <br />
          <br />
          <br />
          Una vez que des clic en "Enviar correo de recuperación", revisa tu
          bandeja de entrada (recuerda revisar la carpeta de spam/no deseado).
        </p>
        <div class="my-4">
          <v-form @submit.prevent="">
            <v-container>
              <v-row>
                <v-col cols="12" md="6" offset-md="3">
                  <v-text-field
                    label="Correo Electrónico"
                    type="email"
                    v-model="email"
                    required
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
          <v-btn class="bg-greenShadow" @click="sendRecoveryEmail">
            Enviar correo de recuperación
          </v-btn>
        </div>
        <div class="my-4">
          <NuxtLink href="/" class="h-100">
            <v-btn class="bg-primary"> Prefiero iniciar sesión </v-btn>
          </NuxtLink>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
