<script setup lang="ts">
import quiz from "~/utils/constants/dummy-quiz"
  let pageNumber =  Math.floor(Math.random() * 5)
</script>

<template>
  <div class="d-flex flex-column justify-center align-center h-screen">
    <v-sheet
      class="w-85 h-85 pa-4"
      rounded="xl"
      :elevation="8"
    >
      {{pageNumber}}
    </v-sheet>
  </div>
</template>
