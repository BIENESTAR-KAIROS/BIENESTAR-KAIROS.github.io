<script setup lang="ts">
import {
  useQuizStore,
  QuestionType,
  activeSubquestions,
  expandQuestion,
  expandQuiz,
  isAnswered,
  type IQuizResponse,
} from '~/store/quiz'
import type { SendQuestionAnswerDto } from '~/interfaces/quizzes/questionnaire-answere.interface'
import { useUserStore } from '~/store/user'

const route = useRoute()
const { $router } = useNuxtApp()
const quizStore = useQuizStore()
const userStore = useUserStore()

const isSending = ref(false)
const errorMessage = ref('')
const showHistory = ref(false)

const actualQuestion = computed(() => quizStore.actualQuestion)

const canAccessQuestionHistory = computed(
  () => quizStore.canAccessQuestionHistory,
)

const isLastQuestion = computed(
  () => actualQuestion.value === quizStore.quiz.length - 1,
)

// Kept in sync for anything else in the flow still reading the store flag.
watch(isLastQuestion, (value) => (quizStore.isLastQuestion = value), {
  immediate: true,
})

const expandedQuiz = computed(() => expandQuiz(quizStore.quiz))

const remainingQuestions = computed(
  () => expandedQuiz.value.filter((question) => !isAnswered(question)).length,
)

const isFinished = computed(() => remainingQuestions.value === 0)

/** Subquestions the answer to the question on screen just opened. */
const addedQuestions = computed(() => {
  const question = quizStore.quiz[actualQuestion.value]
  if (!question) return 0
  return activeSubquestions(question).flatMap(expandQuestion).length
})

function selectQuestion(numberQuestion: number) {
  quizStore.actualQuestion = numberQuestion
  showHistory.value = false
}

function clickNext() {
  errorMessage.value = ''
  if (!isLastQuestion.value) quizStore.actualQuestion += 1
}

function clickPrevious() {
  errorMessage.value = ''
  if (actualQuestion.value > 0) quizStore.actualQuestion -= 1
}

const cleanAnswer = (question: IQuizResponse): SendQuestionAnswerDto => {
  const { answer } = question
  const keepAsIs =
    Array.isArray(answer) ||
    question.type === QuestionType.TEXT ||
    question.type === QuestionType.DATE

  return {
    questionId: question.questionId,
    response: keepAsIs ? answer : Number(answer),
  }
}

/**
 * Only the questions the student actually saw are submitted — answers left
 * behind on a branch they moved away from are dropped.
 */
const collectAnswers = (): SendQuestionAnswerDto[] =>
  expandQuiz(quizStore.quiz).filter(isAnswered).map(cleanAnswer)

async function finalizeQuiz() {
  if (!isFinished.value) {
    errorMessage.value = `Te faltan ${remainingQuestions.value} ${
      remainingQuestions.value === 1 ? 'pregunta' : 'preguntas'
    } por responder.`
    return
  }

  errorMessage.value = ''
  isSending.value = true

  try {
    quizStore.answers = collectAnswers()
    const response = await quizStore.sendAnswers()

    if (!response) {
      errorMessage.value = 'No pudimos enviar tus respuestas. Intenta de nuevo.'
      return
    }

    if (response.hasRecomendations) {
      userStore.lastQuizId = route.params.id as string
      await $router.push('/user/quiz/finish-quizz')
      return
    }

    if (userStore.user) {
      userStore.user.questionnaireQueue = {
        queue: userStore.user.questionnaireQueue.queue.map((item) =>
          item.questionnaireId === route.params.id
            ? { ...item, solved: true }
            : item,
        ),
      }

      const thisQuiz = userStore.user.questionnaireQueue.queue.find(
        (item) => item.questionnaireId === route.params.id,
      )

      if (thisQuiz && thisQuiz.solved) {
        const nextQuiz = userStore.user.questionnaireQueue.queue.find(
          (item) => !item.solved,
        )

        userStore.lastQuizId = route.params.id as string

        if (nextQuiz) {
          $router.push(`/user/quiz/${nextQuiz.questionnaireId}`)
        } else {
          $router.push('/user/dashboard')
        }
      }
    }
  } catch (error: any) {
    errorMessage.value = 'No pudimos enviar tus respuestas. Intenta de nuevo.'
    console.log(error)
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div class="quiz-nav">
    <div v-if="showHistory" class="quiz-nav__history">
      <span class="quiz-nav__history-title">Ir a una pregunta</span>
      <div class="quiz-nav__history-grid">
        <button
          v-for="(question, index) in quizStore.quiz"
          :key="question.questionId"
          type="button"
          class="quiz-nav__chip"
          :class="{
            'quiz-nav__chip--done': isAnswered(question),
            'quiz-nav__chip--current': index === actualQuestion,
          }"
          @click="selectQuestion(index)"
        >
          {{ index + 1 }}
        </button>
      </div>
    </div>

    <p v-if="errorMessage" class="quiz-nav__error" role="alert">
      {{ errorMessage }}
    </p>

    <div class="quiz-nav__bar">
      <span class="quiz-nav__note">
        <template v-if="addedQuestions > 0">
          Se {{ addedQuestions === 1 ? 'añadió' : 'añadieron' }}
          {{ addedQuestions }}
          {{ addedQuestions === 1 ? 'pregunta' : 'preguntas' }} por tu
          respuesta.
        </template>
        <template v-else-if="remainingQuestions > 0">
          Te {{ remainingQuestions === 1 ? 'falta' : 'faltan' }}
          {{ remainingQuestions }}
          {{ remainingQuestions === 1 ? 'pregunta' : 'preguntas' }}.
        </template>
        <template v-else> Ya respondiste todas las preguntas. </template>
      </span>

      <div class="quiz-nav__actions">
        <button
          v-if="canAccessQuestionHistory"
          type="button"
          class="quiz-nav__ghost"
          :aria-expanded="showHistory"
          @click="showHistory = !showHistory"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 4v4h4M12 8v4l3 2" />
          </svg>
          Historial
        </button>

        <button
          type="button"
          class="quiz-nav__secondary"
          :disabled="actualQuestion === 0"
          @click="clickPrevious"
        >
          Anterior
        </button>

        <button
          v-if="!isLastQuestion"
          type="button"
          class="quiz-nav__primary"
          @click="clickNext"
        >
          Siguiente
        </button>

        <button
          v-else
          type="button"
          class="quiz-nav__primary"
          :disabled="isSending"
          @click="finalizeQuiz"
        >
          {{ isSending ? 'Enviando…' : 'Finalizar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-nav {
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
  padding-top: 16px;
  border-top: 1px solid #f0f5f6;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.quiz-nav__history {
  background: #f4f8f9;
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quiz-nav__history-title {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5f767e;
}

.quiz-nav__history-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quiz-nav__chip {
  min-width: 40px;
  height: 40px;
  padding: 0 10px;
  border-radius: 999px;
  border: 2px solid #e3ecee;
  background: #fff;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #4b5f68;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.quiz-nav__chip:hover {
  border-color: #6cc5cb;
}

.quiz-nav__chip--done {
  border-color: #07979f;
  background: #f0fafa;
  color: #065c5d;
}

.quiz-nav__chip--current {
  border-color: #065c5d;
  background: #065c5d;
  color: #fff;
}

.quiz-nav__error {
  margin: 0;
  border-radius: 16px;
  background: #fdf4e7;
  padding: 12px 16px;
  font-size: 13.5px;
  font-weight: 600;
  color: #8a5a17;
}

.quiz-nav__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.quiz-nav__note {
  flex: 1;
  min-width: 180px;
  font-size: 13px;
  color: #4b5f68;
}

.quiz-nav__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quiz-nav__ghost,
.quiz-nav__secondary,
.quiz-nav__primary {
  height: 46px;
  border-radius: 999px;
  font-family: 'Figtree', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease;
}

.quiz-nav__ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 18px;
  border: 0;
  background: #f4f8f9;
  color: #4b5f68;
}

.quiz-nav__ghost svg {
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
}

.quiz-nav__ghost:hover {
  background: #dbf2f4;
  color: #065c5d;
}

.quiz-nav__secondary {
  padding: 0 22px;
  border: 2px solid #cfdde1;
  background: #fff;
  color: #0e2a36;
}

.quiz-nav__secondary:hover:not(:disabled) {
  border-color: #07979f;
  color: #07979f;
}

.quiz-nav__secondary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.quiz-nav__primary {
  padding: 0 26px;
  border: 0;
  background: #065c5d;
  color: #fff;
}

.quiz-nav__primary:hover:not(:disabled) {
  background: #07979f;
}

.quiz-nav__primary:disabled {
  background: #cfdde1;
  cursor: not-allowed;
}

@media (max-width: 700px) {
  .quiz-nav__actions {
    width: 100%;
    gap: 10px;
  }

  .quiz-nav__ghost {
    padding: 0 14px;
  }

  .quiz-nav__secondary,
  .quiz-nav__primary {
    flex: 1;
    padding: 0 14px;
    text-align: center;
  }
}
</style>
