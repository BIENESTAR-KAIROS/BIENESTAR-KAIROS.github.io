<script setup lang="ts">
import type { ILoginResponse } from '~/interfaces/login/login-response.interface'
import { USER_TYPE } from '~/interfaces/users/user.interface'
import { useAuthStore } from '~/store/auth'
import { required, validEmail } from '~/utils/helpers/form-rules'

const { $axios, $router } = useNuxtApp()

const email = ref('')
const password = ref('')
const isFormValid = ref(false)
const isLoading = ref(false)

const authStore = useAuthStore()

const login = async () => {
  if (isFormValid.value) {
    try {
      isLoading.value = true
      const { data: session } = await $axios.post<ILoginResponse>(
        '/auth/login',
        {
          email: email.value,
          password: password.value,
        },
      )

      await authStore.setAuth(session)

      if (authStore.isAuthenticated) {
        if (
          authStore.user?.type == USER_TYPE.INSTITUTION ||
          authStore.user?.type == USER_TYPE.ADMINISTRATIVE
        ) {
          $router.push('/institute/dashboard')
        } else {
          $router.push('/user/dashboard')
        }
      }
    } catch (error) {
      console.log(error)
    } finally {
      isLoading.value = false
    }
  }
}
</script>

<template>
  <v-form v-model="isFormValid" @submit.prevent="login">
    <v-container class="h-100">
      <v-row>
        <v-col cols="10" offset="1">
          <v-sheet class="rounded-xxl">
            <v-text-field
              label="Email"
              bg-color="loginInput"
              variant="solo-filled"
              clearable
              rounded="xxl"
              v-model="email"
              :rules="[required, validEmail]"
              append-inner-icon="mdi-email-outline"
              validate-on="lazy input"
            />
          </v-sheet>
        </v-col>
        <v-col cols="10" offset="1">
          <v-text-field
            label="Contraseña"
            bg-color="loginInput"
            variant="solo-filled"
            clearable
            rounded="xxl"
            v-model="password"
            :rules="[required]"
            append-inner-icon="mdi-lock-outline"
            type="password"
          />
          <div class="w-100 text-right">
            <a class="text-button yantramanav-light" href="/forgot-password">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </v-col>
        <v-col>
          <div class="d-flex justify-center w-100">
            <v-btn
              color="greenShadow"
              :loading="isLoading"
              :disabled="isLoading"
              type="submit"
            >
              Iniciar Sesión
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <v-container class="pa-0">
        <v-row no-gutters>
          <v-col offset="1">
            <div
              class="d-flex h-100 w-100 justify-center align-center text-black"
            >
              <hr class="w-100" />
            </div>
          </v-col>
          <v-col cols="1">
            <div class="d-flex justify-center align-center">
              <span class="text-button yantramanav-light"> ó </span>
            </div>
          </v-col>
          <v-col>
            <div
              class="d-flex h-100 w-100 justify-center align-center text-black"
            >
              <hr class="w-100" />
            </div>
          </v-col>
          <v-col cols="1"> </v-col>
        </v-row>
      </v-container>
      <v-container class="pa-0">
        <v-row no-gutters>
          <v-col>
            <div class="d-flex justify-center w-100">
              <NuxtLink href="/register">
                <v-btn color="primary"> Crear Cuenta </v-btn>
              </NuxtLink>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </v-form>
</template>
