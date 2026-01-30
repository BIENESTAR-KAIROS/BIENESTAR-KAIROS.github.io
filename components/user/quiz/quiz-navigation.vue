<script setup lang="ts">
import { useQuizStore, type IQuizResponse } from '~/store/quiz'
import { useDisplay } from 'vuetify'
import type { SendQuestionAnswerDto } from '~/interfaces/quizzes/questionnaire-answere.interface'

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

const canAccessQuestionHistory = computed(() => {
  return quizStore.canAccessQuestionHistory
})

function selectQuestion(numberQuestion: number) {
  quizStore.actualQuestion = numberQuestion
}

function clickNext() {
  if (actualQuestion.value === totalQuesitons.value - 1)
    quizStore.isLastQuestion = true
  else quizStore.actualQuestion += 1
}

function clickPrevious() {
  if (actualQuestion.value === 0) return
  else quizStore.actualQuestion -= 1
}

const cleanAnswer = (answer: IQuizResponse): SendQuestionAnswerDto => {
  return {
    questionId: answer.questionId,
    response: new Number(answer.answer) as number,
  }
}

const cleanAnswers = (answers: IQuizResponse[]) => {
  answers.forEach((answer) => {
    if ((answer.answer as number) > -1)
      quizStore.answers.push(cleanAnswer(answer))

    if (answer.options.length > 0) {
      answer.options.forEach((option) => {
        if (option.subquestions && option.subquestions.length > 0) {
          cleanAnswers(option.subquestions)
        }
      })
    }
  })
}

async function finalizeQuiz() {
  if (!isFinished.value) {
    alert('No has contestado todas las preguntas')
    return
  }

  try {
    quizStore.answers = []
    cleanAnswers(quizStore.quiz)
    const response = await quizStore.sendAnswers()

    if (!response) {
      alert('Error al enviar las respuestas')
      return
    }

    if (response.hasRecomendations)
      await $router.push('/user/quiz/finish-quizz')
    else await $router.push('/user/dashboard')
  } catch (error: any) {
    console.log(error)
  }
}

const isFinished = computed(() => {
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
    <v-btn value="previous" class="text-secondary" @click="clickPrevious">
      <v-icon>mdi-arrow-left-bold</v-icon>
      <span>Anterior</span>
    </v-btn>

    <v-menu v-if="canAccessQuestionHistory">
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
          <v-list-item-title>Pregunta {{ i }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-btn
      value="finalize"
      class="text-secondary"
      @click="finalizeQuiz"
      v-show="isFinished"
    >
      <v-icon>mdi-check</v-icon>
      <span>Finalizar</span>
    </v-btn>

    <v-btn
      value="next"
      class="text-secondary"
      @click="clickNext"
      v-show="!isFinished"
    >
      <v-icon>mdi-arrow-right-bold</v-icon>
      <span>Siguiente</span>
    </v-btn>
  </v-bottom-navigation>

  <div v-show="!mobile">
    <v-container class="pa-0">
      <v-row no-gutters class="mt-1">
        <v-col cols="2">
          <v-btn @click="clickPrevious" color="thirdy">
            <v-icon class="ms-2">mdi-arrow-left-bold</v-icon>
            Anterior
          </v-btn>
        </v-col>

        <v-col cols="2">
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

        <v-col cols="2" offset="6">
          <v-menu v-if="canAccessQuestionHistory">
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
                <v-list-item-title>Pregunta {{ i }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
