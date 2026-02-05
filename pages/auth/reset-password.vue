<script setup lang="ts">
definePageMeta({
  layout: 'empty-login',
})

const route = useRoute()
const token = route.query.token as string | undefined

const success = ref(false)
const newPassword = ref('')
const confirmNewPassword = ref('')

const { $axios } = useNuxtApp()
const sendNewPassword = async (event) => {
  event.preventDefault()
  try {
    if (!token) {
      alert('Token de recuperación no proporcionado.')
      return
    }

    if (newPassword.value !== confirmNewPassword.value) {
      alert('Las contraseñas no coinciden.')
      return
    }

    const response = await $axios.post<{ success: boolean }>(
      '/auth/reset-password',
      {
        token: token,
        newPassword: newPassword.value,
      },
    )

    if (response.data.success) {
      alert('Contraseña restablecida con éxito. Ahora puedes iniciar sesión.')
      success.value = true
    } else {
      throw new Error('No se pudo restablecer la contraseña.')
    }
  } catch (error) {
    console.log(error)
    alert('Error al restablecer la contraseña.')
  }
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="my-4">
          <h1 class="handlee-regular text-h2 font-weight-thin">
            Restablecer contraseña
          </h1>
        </div>
        <p class="catamaran-regular">
          Por favor ingresa tu nueva contraseña a continuación.
        </p>
      </v-col>
      <v-col>
        <v-form>
          <v-container>
            <v-row>
              <v-col cols="12" md="6" offset-md="3">
                <v-text-field
                  label="Nueva Contraseña"
                  type="password"
                  v-model="newPassword"
                  required
                />
              </v-col>
              <v-col cols="12" md="6" offset-md="3">
                <v-text-field
                  label="Confirmar Nueva Contraseña"
                  type="password"
                  v-model="confirmNewPassword"
                  required
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6" offset-md="3">
                <div class="d-flex justify-center w-100">
                  <v-btn
                    color="greenShadow"
                    @click="sendNewPassword"
                    type="submit"
                  >
                    Restablecer Contraseña
                  </v-btn>
                </div>
              </v-col>
              <v-col cols="12">
                <div class="d-flex justify-center w-100" v-if="!success">
                  <v-btn color="primary" type="submit" :variant="'plain'">
                    Iniciar sesión
                  </v-btn>
                </div>
                <div class="d-flex justify-center w-100" v-if="success">
                  <NuxtLink to="/">
                    <v-btn color="primary" type="submit" :variant="'elevated'">
                      Iniciar sesión
                    </v-btn>
                  </NuxtLink>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>
