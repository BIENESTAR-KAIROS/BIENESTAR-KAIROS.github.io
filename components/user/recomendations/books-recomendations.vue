<script setup lang="ts">
import { ref } from 'vue'
const books: {title:string}[] = ref([])

onMounted(async () => {
  let pageNumber =  Math.floor(Math.random() * 4)
  await fetch(`https://openlibrary.org/search.json?subject=salud mental&limit=12&page=${pageNumber}`)
  .then(response => response.json())
  .then(data => {
    books.value = data.docs
    console.log(data)
  });
})
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="my-4">
          <h1 class="handlee-regular text-h3 font-weight-thin">
            Recomendaciones de libros
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
        v-for="(book, i) in books"
        :key="i"
        cols="6"
        md="4"
        lg="3"
      >
        <v-sheet
          rounded="xl"
          height="300"
          class="px-4 py-2 pt-5 d-flex flex-column justify-space-between align-center text-center"
          :elevation="5"
        >
          <v-img
            :src="'https://covers.openlibrary.org/b/olid/'+ book.cover_edition_key +'.jpg'"
            lazy-src="/logo-dark.png"
            height="110"
            width="80"
          />
          <span class="text-h6 catamaran-regular">{{ book.title }}</span>
          <span class="text-body-1 catamaran-regular">{{ book.author_name[0] }}</span>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

