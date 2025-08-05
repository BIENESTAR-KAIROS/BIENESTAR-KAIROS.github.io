<script setup lang="ts">
definePageMeta({
  layout: 'empty-login',
})
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
        </p>
        <div class="my-4">
          <v-form @submit.prevent="">
            <v-container>
              <v-row>
                <v-col cols="12" md="6" offset-md="3">
                  <v-text-field
                    label="Correo Electrónico"
                    type="email"
                    required
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-form>
          <NuxtLink href="/" class="h-100">
            <v-btn
              class="bg-greenShadow v-btn v-btn--elevated v-theme--kairos v-btn--density-default v-btn--size-default v-btn--variant-elevated"
            >
              Enviar correo de recuperación
            </v-btn>
          </NuxtLink>
        </div>
        <div class="my-4">
          <NuxtLink href="/" class="h-100">
            <v-btn
              class="v-btn v-btn--elevated v-theme--kairos bg-primary v-btn--density-default v-btn--size-default v-btn--variant-elevated"
            >
              Prefiero iniciar sesión
            </v-btn>
          </NuxtLink>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
