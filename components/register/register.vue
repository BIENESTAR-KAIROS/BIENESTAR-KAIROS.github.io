<script setup lang="ts">
import type { UserRegisterRequestDto } from '~/dto/request/user/user-register.request.dto'
import type AuthRegisterDto from '~/interfaces/register/register.dto'
import { UserGenderEnum } from '~/interfaces/user/enum/user-gender.enum'
import { useAuthStore } from '~/store/auth'
import { useUserStore } from '~/store/user'
import { required, validEmail } from '~/utils/helpers/form-rules'

const userStore = useUserStore()
const authStore = useAuthStore()

const show = ref(false)

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

async function register() {
  const nuxtApp = useNuxtApp()

  const response = await userStore.registerUser(defaultRegisterData.value)
  if (response.message === 'Usuario registrado correctamente') {
    await authStore.setAuth(response)
    nuxtApp.$router.push('/user/register/campus-info')
  }
}
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <v-card class="pa-5 rounded-xxl" outlined elevation="5">
          <v-card-title class="text-h4 text-center mb-2">
            Registro de Usuario
          </v-card-title>
          <v-form @submit.prevent="register">
            <v-container>
              <v-row no-gutters>
                <v-col cols="12" md="8" offset-md="2" class="mb-md-2">
                  <v-text-field
                    label="Nombre/s"
                    v-model="defaultRegisterData.name"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    :rules="[required]"
                    append-inner-icon="mdi-account-outline"
                    validate-on="lazy input"
                    required
                  />
                </v-col>
                <v-col cols="12" md="3" offset-md="2" class="mb-md-2">
                  <v-text-field
                    label="Apellido Paterno"
                    v-model="defaultRegisterData.lastName"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    :rules="[required]"
                    validate-on="lazy input"
                    required
                  />
                </v-col>
                <v-col cols="12" md="3" offset-md="2" class="mb-md-2">
                  <v-text-field
                    label="Apellido Materno"
                    v-model="defaultRegisterData.surName"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    :rules="[required]"
                    validate-on="lazy input"
                    required
                  />
                </v-col>
                <v-col cols="12" md="3" offset-md="2" class="mb-md-2">
                  <v-number-input
                    label="Edad"
                    v-model="defaultRegisterData.studentData!.age"
                    :min="12"
                    :max="99"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    :rules="[required]"
                    validate-on="lazy input"
                    required
                  />
                </v-col>
                <v-col cols="12" md="3" offset-md="2" class="mb-md-2">
                  <v-select
                    label="Género"
                    v-model="defaultRegisterData.studentData!.gender"
                    :item-props="true"
                    :items="['Masculino', 'Femenino', 'Otro']"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    :rules="[required]"
                    validate-on="lazy input"
                    required
                  />
                </v-col>
                <v-col cols="12" md="8" offset-md="2" class="mb-md-2">
                  <v-text-field
                    label="Correo Electrónico"
                    v-model="defaultRegisterData.email"
                    type="email"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    :rules="[required, validEmail]"
                    validate-on="lazy input"
                    append-inner-icon="mdi-email-outline"
                    required
                  />
                </v-col>
                <v-col cols="12" md="8" offset-md="2" class="mb-md-2">
                  <v-text-field
                    label="Contraseña"
                    v-model="defaultRegisterData.password"
                    :type="show ? 'text' : 'password'"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    :rules="[required]"
                    validate-on="lazy input"
                    :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                    required
                    persistent-clear
                    @click:append-inner="show = !show"
                  />
                </v-col>
                <v-col cols="12" md="8" offset-md="2" class="mb-md-2">
                  <v-text-field
                    label="Confirma tu contraseña"
                    v-model="passwordConfirm"
                    type="password"
                    bg-color="loginInput"
                    variant="solo-filled"
                    clearable
                    rounded="xxl"
                    :rules="[required]"
                    validate-on="lazy input"
                    append-inner-icon="mdi-lock-outline"
                    required
                  />
                </v-col>
                <v-col cols="12" class="d-flex justify-center mt-2">
                  <v-btn type="submit" color="primary">Registrarme</v-btn>
                </v-col>
                <v-col cols="12" class="d-flex justify-center mt-4">
                  <nuxt-link to="/">
                    <span class="text-thirdy">
                      ¿Ya tienes una cuenta? Inicia sesión
                    </span>
                  </nuxt-link>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
