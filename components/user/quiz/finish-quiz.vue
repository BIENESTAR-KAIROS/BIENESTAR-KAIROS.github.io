<template>
  <v-row class="h-screen">
    <v-col cols="12" md="3" class="h-100">
      <div class="d-block d-md-none">
        <v-img src="/image-result-quiz.png" height="200" />
      </div>
      <div class="d-none d-md-flex h-100 flex-column pa-4">
        <v-img src="/image-result-quiz.png" height="300" />
      </div>
    </v-col>
    <v-col class="h-100">
      <div class="d-flex h-100 flex-column justify-center pa-5">
        <v-card elevation="5" class="">
          <v-card-title class="handlee-regular text-h4 font-weight-thin">
            Tus resultados
          </v-card-title>
        </v-card>
      </div>
    </v-col>
  </v-row>
</template>
