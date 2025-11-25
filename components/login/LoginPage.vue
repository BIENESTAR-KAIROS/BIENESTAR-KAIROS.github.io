<script setup lang="ts">
import LoginForm from './LoginForm.vue'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()

const isMobile = computed(() => {
  return mobile.value == true
})
</script>

<template>
  <v-container class="h-screen">
    <v-row class="h-100" no-gutters>
      <v-col class="d-flex flex-column justify-space-around align-center">
        <div>
          <v-img
            src="/logo-dark.png"
            height="150"
            width="200"
            class="nav-logo"
          />
        </div>
        <v-card
          :elevation="4"
          class="rounded-xxxl h-100 w-100 bg-backgroundSecondary"
        >
          <v-container class="pa-0 h-100">
            <v-row class="h-100" no-gutters>
              <v-col class="d-flex flex-column justify-center h-100">
                <span class="handlee-regular text-center text-h4">
                  ¡Qué gusto verte!
                </span>
                <LoginForm />
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
