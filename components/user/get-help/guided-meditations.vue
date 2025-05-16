<script setup lang="ts">
const practices = [
  {
    title: 'Diario de gratitud',
    description: 'Un espacio donde registras regularmente lo que agradeces para entrenar tu mente a enfocarse en lo positivo, mejorar tu bienestar emocional y transformar tu perspectiva de vida.',
    image: '/image-dashboard-18.png',
    link: 'https://www.youtube.com/watch?v=POj_coOBUBs',
  },
  {
    title: 'Diario de gratitud',
    description: 'En esta meditación guiada para la ansiedad y las emociones negativas vamos a realizar 15 minutos mágicos que te aportarán paz y calma mental además de eliminar el estrés, la ansiedad y los pensamientos negativos. Es perfecta si estás pasando un momento difícil, si acabas de sufrir una pérdida o estás pasando por un duelo, si experimentas depresión o si simplemente estás teniendo un mal día y quieres sentirte mejor al instante.',
    image: '/image-dashboard-18.png',
    link: 'https://youtu.be/aBsnQjJ2_Nk?si=I429sLy7sD_yA2lS',
  },
]
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="my-4">
          <h1 class="handlee-regular text-h3 font-weight-thin">
            Meditaciones guiadas
          </h1>
        </div>
      </v-col>
      <v-col cols="12">
        <div class="my-3">
          <span class="catamaran-regular text-subtitle-1">
            Con base en la información que nos has proporcionado en tus cuestionarios, tenemos algunas recomendaciones de prácticas aprobadas por nuestros especialistas que te ayudarán a mejorar tu bienestar.
          </span>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="(practice, i) in practices"
        :key="i"
        cols="12"
        md="3"
        lg="4"
      >
        <v-sheet
          rounded="xl"
          height="500"
          class="px-4 py-2 pt-5 d-flex flex-column justify-space-around align-center text-center"
          :elevation="5"
        >
          <span class="text-h5 catamaran-regular">Meditación {{ i + 1 }}</span>
          <span class="text-body-1 catamaran-regular">{{ practice.description }}</span>
            <v-img :src="practice.image" height="110" width="110"/>
          <a :href="practice.link" class="text-decoration-none">
            <v-btn class="rounded-ts-xl rounded-be-xl rounded-bs-0 rounded-te-0 text-body-1 catamaran-regular bg-primary">
              Saber más...
            </v-btn>
          </a>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
