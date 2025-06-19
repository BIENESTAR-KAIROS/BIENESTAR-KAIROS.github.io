<script setup lang="ts">
const practices = [
  {
    title: 'Diario de gratitud',
    description:
      'Un espacio donde registras regularmente lo que agradeces para entrenar tu mente a enfocarse en lo positivo, mejorar tu bienestar emocional y transformar tu perspectiva de vida.',
    link: 'https://www.elpradopsicologos.es/blog/diario-gratitud/',
  },
]
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="my-4">
          <h1 class="handlee-regular text-h3 font-weight-thin">
            Prácticas del bienestar
          </h1>
        </div>
      </v-col>
      <v-col cols="12">
        <div class="my-3">
          <span class="catamaran-regular text-subtitle-1">
            Con base en la información que nos has proporcionado en tus
            cuestionarios, tenemos algunas recomendaciones de prácticas
            aprobadas por nuestros especialistas que te ayudarán a mejorar tu
            bienestar.
          </span>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="(practice, i) in practices" :key="i" cols="12" md="3">
        <v-sheet
          rounded="xl"
          height="300"
          class="px-4 py-2 pt-5 d-flex flex-column justify-space-around align-center text-center"
          :elevation="5"
        >
          <span class="text-h5 catamaran-regular">{{ practice.title }}</span>
          <span class="text-body-1 catamaran-regular">{{
            practice.description
          }}</span>
          <a :href="practice.link" class="text-decoration-none">
            <v-btn
              class="rounded-ts-xl rounded-be-xl rounded-bs-0 rounded-te-0 text-body-1 catamaran-regular bg-primary"
            >
              Saber más...
            </v-btn>
          </a>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
