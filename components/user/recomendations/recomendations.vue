<script setup lang="ts">
import { ref } from 'vue'
import BooksRecomendations from './books-recomendations.vue'
import CustomRecomendations from './custom-recomendations.vue'
import News from './news.vue'

const tab = ref(null)
const tabContent = [null, CustomRecomendations, BooksRecomendations, News]
</script>

<template>
  <v-card class="help-card border-s-0 mt-2" elevation="0">
    <v-tabs v-model="tab" align-tabs="center" color="greenShadow">
      <v-tab :value="1">Recomendaciones personalizadas</v-tab>
      <v-tab :value="2">Recomendaciones de libros</v-tab>
      <v-tab :value="3">Noticias relevantes</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item v-for="n in 3" :key="n" :value="n">
        <div class="pa-2 h-100">
          <component :is="tabContent[n]" />
        </div>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-card>
</template>

<style scoped>
.help-card {
  background-color: #ffffff00;
}
</style>
