<script setup lang="ts">
import { useQuizStore } from '~/store/quiz'
import { useDisplay } from 'vuetify'

const { $router } = useNuxtApp()
const { mobile } = useDisplay()

const quizStore = useQuizStore()

let isLastQuestion = computed(() => {
  return quizStore.isLastQuestion
})

const actualQuestion = computed(() => {
  return quizStore.actualQuestion
})

const totalQuesitons = computed(() => {
  return quizStore.totalQuestions
})

function selectQuestion(numberQuestion: number) {
  quizStore.actualQuestion = numberQuestion
}

function clickNext() {
  if (actualQuestion.value === totalQuesitons.value - 1)
    quizStore.isLastQuestion = true
  else quizStore.actualQuestion += 1
}

async function finalizeQuiz() {
  console.log(countAnsweredQuestions.value)
  console.log(isFinished.value)

  if (isFinished.value) {
    try {
      await quizStore.sendAnswers()
    } catch (error) {
      console.error('Error on send answers:', error)
      alert('Ocurrió un error al enviar tus respuestas.')
      return
    } finally {
      $router.push('/user/quiz/finish-quizz')
    }
  } else {
    alert('No has contestado todas las preguntas')
  }
}
let isFinished = computed(() => {
  return quizStore.totalQuestions === countAnsweredQuestions.value
})
const countAnsweredQuestions = computed(() => {
  let count = 0
  quizStore.quiz.map((question) => {
    if ((question.answer as number) > -1) count++
  })
  return count
})
</script>

<template>
  <v-bottom-navigation v-show="mobile" :elevation="0" grow>
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn value="recent" v-bind="props">
          <v-icon>mdi-history</v-icon>

          <span>Historial</span>
        </v-btn>
      </template>

      <v-list>
        <v-list-item
          v-for="i in totalQuesitons"
          :key="i"
          :value="i - 1"
          @click="selectQuestion(i - 1)"
        >
          <v-list-item-title>Pregunta {{ i }} </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-btn
      value="finalize"
      :class="isLastQuestion ? 'text-secondary' : 'text-disabled'"
      @click="finalizeQuiz"
    >
      <v-icon>mdi-check</v-icon>

      <span>Finalizar</span>
    </v-btn>

    <v-btn value="next" class="text-secondary" @click="clickNext">
      <v-icon>mdi-arrow-right-bold</v-icon>
      <span>Siguiente</span>
    </v-btn>
  </v-bottom-navigation>
  <div v-show="!mobile">
    <v-container class="pa-0">
      <v-row no-gutters class="mt-1">
        <v-col cols="2">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn value="recent" v-bind="props" :elevation="8">
                <v-icon>mdi-history</v-icon>

                <span>Historial</span>
              </v-btn>
            </template>

            <v-list>
              <v-list-item
                v-for="i in totalQuesitons"
                :key="i"
                :value="i - 1"
                @click="selectQuestion(i - 1)"
              >
                <v-list-item-title>Pregunta {{ i }} </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
        <v-col cols="2" offset="8">
          <v-btn @click="clickNext" color="secondary" v-show="!isLastQuestion">
            Siguiente
            <v-icon class="ms-2">mdi-arrow-right-bold</v-icon>
          </v-btn>
          <v-btn
            color="secondary"
            v-show="isLastQuestion"
            @click="finalizeQuiz"
          >
            Finalizar
            <v-icon class="ms-2">mdi-check</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
