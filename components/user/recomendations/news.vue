<script setup lang="ts">
import { ref } from 'vue'
import { useDisplay } from "vuetify"

const { mobile } = useDisplay();
const runtimeConfig = useRuntimeConfig()
const news: { title: string; description: string; url: string }[] = ref([])

onMounted(async () => {
  await fetch(`https://gnews.io/api/v4/search?apikey=${runtimeConfig.app.newsApiKey}&q=salud mental&lang=es&max=10`)
  .then(response => response.json())
  .then(data => {
    news.value = data.articles
  });
})
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="my-4">
          <h1 class="handlee-regular text-h3 font-weight-thin">
            Noticias importantes
          </h1>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="(notice, i) in news"
        :key="i"
        cols="12"
      >
        <v-sheet
          rounded="xl"
          :height="(mobile) ? 400 : 250"
          class="px-7 py-4 pt-5 d-flex flex-column justify-space-around align-center text-left"
          :elevation="5"
        >
          <div class="w-100 text-center">
            <span 
              :class="((mobile) ? '' : 'px-3') + ' text-h6 catamaran-regular'"
            >
              {{ notice.title }}
            </span>
          </div>
          <div class="w-100 text-center">
            <span 
              :class="((mobile) ? '' : 'px-3') + ' text-body-1 catamaran-regular'"
            >
              {{ notice.description }}
            </span>
          </div>
          <a :href="notice.url" class="text-decoration-none">
            <v-btn class="rounded-ts-xl rounded-be-xl rounded-bs-0 rounded-te-0 text-body-1 catamaran-regular bg-primary">
              Leer más...
            </v-btn>
          </a>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
