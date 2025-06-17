<script setup lang="ts">
enum ACTIONS {
  SHOW = 'show',
  EDIT = 'edit',
  DELETE = 'delete',
}
const quizzes = ref([
  {
    title: 'Cuestionario estándar',
    brief:
      'Este es el cuestionario original, diseñado por los especialistas de Kairos, puedes ver las preguntas que contiene, pero considera que no es posible modificarlo (puedes duplicarlo y añadir tu propias preguntas o cambiar algunas si lo necesitas).',
    actions: ['show'],
  },
  {
    title: 'Cuestionario grupo 1',
    brief: 'Cuestionario para el grupo 1',
    actions: ['show', 'edit', 'delete'],
  },
])
const actionIcon = ref([
  {
    name: ACTIONS.SHOW,
    icon: 'mdi-eye',
  },
  {
    name: ACTIONS.EDIT,
    icon: 'mdi-pencil',
  },
  {
    name: ACTIONS.DELETE,
    icon: 'mdi-delete',
  },
])
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12" md="6">
        <div class="my-4">
          <h1 class="handlee-regular text-h4 font-weight-thin">
            Mis cuestionarios
          </h1>
        </div>
      </v-col>
      <v-col cols="12" md="6" class="d-none d-md-block">
        <div class="my-4 w-100 d-flex justify-end">
          <NuxtLink href="/institute/quizzes/add-quiz">
            <v-btn
              color="thirdy"
              rounded="xl"
              class="catamaran-regular font-body-1"
            >
              Crear un nuevo cuestionario
            </v-btn>
          </NuxtLink>
        </div>
      </v-col>
      <v-col cols="12">
        <div class="my-4">
          <h2 class="handlee-regular text-h6 font-weight-thin">
            Aquí podrás crear cuestionarios personalizados para tus usuarios,
            puedes seleccionar un grupo de usuarios o un usuario particular.
          </h2>
        </div>
      </v-col>
      <v-col cols="12">
        <v-container>
          <v-row>
            <v-col
              cols="12"
              md="4"
              lg="3"
              v-for="(quiz, index) in quizzes"
              :key="index"
            >
              <v-card color="purpleShadow" class="h-100">
                <template v-slot:title>
                  <span class="catamaran-regular">
                    {{ quiz.title }}
                  </span>
                </template>
                <template v-slot:text>
                  <span class="yantramanav-regular">
                    {{ quiz.brief }}
                  </span>
                </template>
                <template v-slot:actions>
                  <v-btn v-for="(action, j) in quiz.actions">
                    <v-icon>
                      {{ actionIcon.find((act) => act.name === action)?.icon }}
                    </v-icon>
                  </v-btn>
                </template>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
  <div class="d-block d-md-none">
    <a href="/institute/quizzes/add-quiz">
      <v-fab :app="true" location="left bottom" color="thirdy" icon>
        <v-icon> mdi-plus </v-icon>
      </v-fab>
    </a>
  </div>
</template>
