<script setup lang="ts">
import { useAuthStore } from '~/store/auth'

const authStore = useAuthStore()

const demographicSurveyCompleted = computed(() => {
  return authStore.user?.studentData?.demographicSurveyCompleted || false
})
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col class="text-center" cols="3">
        <NuxtGravatar
          :email="authStore.user?.email || ''"
          :size="100"
          class="rounded-circle"
          default-img="robohash"
        />
      </v-col>
      <v-col>
        <div class="ms-2 my-6">
          <h1 class="handlee-regular text-h3 font-weight-thin">Mi perfil</h1>
        </div>
      </v-col>
    </v-row>
    <v-row v-if="!demographicSurveyCompleted" class="my-6">
      <v-col cols="12" md="6" lg="4">
        <NuxtLink to="/user/quiz/demographic">
          <v-btn color="secondary" class="ma-2 catamaran-regular text-body-1">
            Responder cuestionario sociodemográfico
          </v-btn>
        </NuxtLink>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col class="text-center" cols="12">
        <p class="catamaran-regular text-body-1">
          Aqui te mostraremos la información que vayamos recopilando de tu
          perfil conforme vayas llenando tus cuestionarios.
          <br /><br />
          Para nosotros tu bienestar siempre es lo más importante, queremos que
          te sientas bien.
          <br /><br />
          Para volver, da clic en el osito.
          <br /><br />
          Recuerda que la Universidad Panamericana pone a tu disposición la
          Unidad de Psicología Clínica para cualquier cosa que necesites.
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>
