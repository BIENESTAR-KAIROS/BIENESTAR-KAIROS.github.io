<script setup lang="ts">
const posibleQuizzes = [
  {
    title: 'Socioeconómico',
    description: 'Este cuestionario nos ayuda a tomar parámetros estadísticas de tus respuestas. Pero sabemos que lo único inamovible es el cambio, puedes responderlo si sientes que algo en tu vida ha cambiado y quieres que lo sepamos, puedes responder este cuestionario.',
    id: '1',
  },
  { 
    title: 'Para la comunidad',
    description: 'Este es un cuestionario que ha diseñado tu organización para tratar de entenderte mejor. \nContiene algunos parámetros generales que pueden ayudarnos a entender mejor tu estado actual.',
    id: '2',
  },
  {
    title: 'Personalizado',
    description: 'Este cuestionario ha sido diseñado únicamente para ti con la información que hemos recuperado de tu perfil y hemos podido analizar. \nEs único, como tú, por lo que puedes sentirte libre de responderlo las veces que lo necesites, nuestro modelo aprenderá paulatinamente de ti.',
    id: '3',
  },
]
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="my-4">
          <h1 class="handlee-regular text-h3 font-weight-thin">
            Responder el cuestionario
          </h1>
        </div>
      </v-col>
      <v-col cols="12">
        <div class="my-3">
          <span class="catamaran-regular text-subtitle-1">
            Actualmente tu organización cuenta con {{ posibleQuizzes.length }} cuestionarios disponibles, puedes responder aquel que creas que puede ayudarnos a dar mejores recomendaciones dependiendo de tu estado de ánimo.
          </span>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="(posibleQuizz, i) in posibleQuizzes"
        :key="i"
        cols="12"
        md="3"
      >
          <v-sheet
            rounded="lg"
            height="500"
            class="px-4 py-2 pt-5 d-flex flex-column justify-space-around align-center text-center"
            :elevation="5"
          >
            <span class="text-h5 catamaran-regular">{{ posibleQuizz.title }}</span>
            <span class="text-body-1 catamaran-regular">{{ posibleQuizz.description }}</span>
        <a :href="'/user/quiz/' + posibleQuizz.id" class="text-decoration-none">
            <v-btn class="text-body-1 catamaran-regular bg-secondary" rounded="lg">
              Responder el cuestionario
            </v-btn>
        </a>
          </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
