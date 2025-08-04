<script setup lang="ts">
import type AuthRegisterDto from '~/interfaces/register/register.dto'
import { useUserStore } from '~/store/user'

const userStore = useUserStore()

const defaultAuthData = ref({
  type: 'student',
  email: '',
  password: '',
  institutionId: '507f1f77bcf86cd799439012',
  studentData: {
    name: '',
    lastName: '',
    age: 12,
    gender: '',
    groupIds: ['684fd320efc0e3279a38cc0a', '685b035d36aa0b3c141cf75a'],
  },
})

async function registerUser(user: AuthRegisterDto) {
  const nuxtApp = useNuxtApp()

  try {
    const response = await nuxtApp.$axios.post('/auth/register', user)
    return response.data
  } catch (error) {
    console.error('Registration error:', error)
  }
}

async function register() {
  const nuxtApp = useNuxtApp()

  const response = await registerUser(defaultAuthData.value)
  console.log('Registration response:', response)
  if (response.message === 'User registered successfully') {
    alert('Usuario registrado exitosamente')
    nuxtApp.$router.push('/')
  }
}
</script>

<template>
  <v-form @submit.prevent="register">
    <v-container>
      <v-row>
        <v-col cols="12" md="6" offset-md="3">
          <v-text-field
            label="Nombre"
            v-model="defaultAuthData.studentData.name"
            required
          />
          <v-text-field
            label="Apellido"
            v-model="defaultAuthData.studentData.lastName"
            required
          />
          <v-number-input
            label="Edad"
            v-model="defaultAuthData.studentData.age"
            :min="12"
            :max="99"
            required
          />
          <v-select
            label="Género"
            v-model="defaultAuthData.studentData.gender"
            :items="['Masculino', 'Femenino', 'Otro']"
            required
          />
          <v-text-field
            label="Correo Electrónico"
            v-model="defaultAuthData.email"
            type="email"
            required
          />
          <v-text-field
            label="Contraseña"
            v-model="defaultAuthData.password"
            type="password"
            required
          />
          <v-btn type="submit" color="primary">Register</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>
