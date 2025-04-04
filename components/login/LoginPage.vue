<script setup lang="ts">
import LoginForm from "./LoginForm.vue"
</script>

<template>
  <v-container>
    <v-row class="h-screen">
      <v-col class="d-flex justify-center align-center">
        <v-card :elevation="4" class="rounded-xxxl h-75 w-100 bg-backgroundSecondary">          
          <v-container class="h-100">
            <v-row class="h-100">
              <v-col class="d-flex justify-center align-center">
                <v-card :elevation="0" class="rounded-xxl h-85 w-85 bg-white">
                  <v-card-title class="handlee-regular text-center text-h4">
                    ¡Qué gusto verte!
                  </v-card-title>
                  <LoginForm />
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
