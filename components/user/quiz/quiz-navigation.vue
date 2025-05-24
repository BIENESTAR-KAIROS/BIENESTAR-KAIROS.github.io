<script setup lang="ts">
import { useQuizStore } from '~/store/quiz';
import { useDisplay } from "vuetify"

const { mobile } = useDisplay();

const quizStore = useQuizStore()

let isFinished = computed(() => {
  return quizStore.isFinished
})

const actualQuestion = computed(() => {
  return quizStore.actualQuestion
})

const totalQuesitons = computed(() => {
  return quizStore.totalQUestions
})

function selectQuestion(numberQuestion: number){
  quizStore.actualQuestion = numberQuestion
}

function clickNext() {
  if(actualQuestion.value === totalQuesitons.value - 1)
    quizStore.isFinished = true;
    else 
    quizStore.actualQuestion += 1
}
</script>

<template>
  <v-bottom-navigation v-if="mobile" :elevation="0" grow>
    <v-menu>
      <template v-slot:activator="{props}">
        <v-btn value="recent" v-bind="props">
          <v-icon>mdi-history</v-icon>

          <span>Historial</span>
        </v-btn>
      </template>

      <v-list>
        <v-list-item
          v-for="i in totalQuesitons"
          :key="i"
          :value="i-1"
          @click="selectQuestion(i-1)"
        >
          <v-list-item-title>Pregunta {{ i }} </v-list-item-title>
        </v-list-item>
      </v-list>

    </v-menu>
    <v-btn 
      value="finalize" 
      :class="(isFinished) ? 'text-secondary' : 'text-disabled'"
    >
      <v-icon>mdi-check</v-icon>

      <span>Finalizar</span>
    </v-btn>

    <v-btn
      value="next"
      class="text-secondary"
      @click="clickNext"
    >
      <v-icon>mdi-arrow-right-bold</v-icon>
      <span>Siguiente</span>
    </v-btn>
  </v-bottom-navigation>
  <div v-else>
    <v-row no-gutters justify="end" class="me-4 mt-5">
      <v-col cols="2" offset="10" class="d-flex justify-end">
        <v-btn
          @click="clickNext"
          color="secondary"
        >      
          Siguiente
          <v-icon class='ms-2'>mdi-arrow-right-bold</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>
