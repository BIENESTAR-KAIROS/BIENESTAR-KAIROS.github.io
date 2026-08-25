<script setup lang="ts">
import QuizNavigation from './quiz-navigation.vue'
import Question from './question.vue'
import {
  useQuizStore,
  QuestionType,
  expandQuestion,
  expandQuiz,
  isAnswered,
  type IQuizResponse,
} from '~/store/quiz'
import type { IQuestion, IQuiz } from '~/interfaces/quizzes/quiz.interface'
import { useAuthStore } from '~/store/auth'

const route = useRoute()
const { $axios } = useNuxtApp()

const authStore = useAuthStore()
const quizStore = useQuizStore()

const isLoading = ref(true)
const loadFailed = ref(false)

/** Falls back instead of rendering nothing when the backend sends a new type. */
const resolveType = (type: string, hasOptions: boolean): QuestionType => {
  const known = QuestionType[type?.toUpperCase() as keyof typeof QuestionType]
  if (known) return known
  return hasOptions ? QuestionType.MULTIPLE_CHOICE : QuestionType.TEXT
}

onMounted(async () => {
  if (authStore.user) {
    quizStore.studentId = authStore.user._id
  }

  const questionResponse = (question: IQuestion): IQuizResponse => {
    return {
      questionId: question.id,
      questionnaireId: route.params.id as string,
      question: question.text,
      category: question.category || null,
      options: question.options.map((option) => ({
        option,
        subquestions: option.subquestions
          ? option.subquestions.map((sub) => questionResponse(sub))
          : [],
      })),
      answer: -1,
      type: resolveType(question.type, question.options.length > 0),
    }
  }

  try {
    isLoading.value = true
    const { data: quiz } = await $axios.get<IQuiz>(
      `/questionnaire/${route.params.id}`,
    )
    quizStore.quiz = []
    quizStore.isLastQuestion = false
    quizStore.isFinished = false
    quizStore.totalQuestions = 0
    quizStore.actualQuestion = 0
    quizStore.quizName = quiz.title
    quizStore.evaluateByCategory = quiz.evaluateByCategory || false
    for (let i = 0; i < quiz.questions.length; i++) {
      quizStore.quiz.push(questionResponse(quiz.questions[i]))
    }
    quizStore.totalQuestions = quiz.questions.length
    quizStore.canAccessQuestionHistory = quiz.canAccessQuestionHistory
  } catch (error) {
    loadFailed.value = true
    console.log(error)
  } finally {
    isLoading.value = false
  }
})

const currentQuestion = computed<IQuizResponse | undefined>(
  () => quizStore.quiz[quizStore.actualQuestion],
)

/** Every question the current answers opened, so branches count towards the total. */
const expandedQuiz = computed(() => expandQuiz(quizStore.quiz))

const totalQuestions = computed(() => expandedQuiz.value.length)

const answeredQuestions = computed(
  () => expandedQuiz.value.filter(isAnswered).length,
)

// Position of the current question once the opened branches are counted in.
const questionPosition = computed(
  () =>
    quizStore.quiz.slice(0, quizStore.actualQuestion).flatMap(expandQuestion)
      .length + 1,
)

const progress = computed(() =>
  totalQuestions.value === 0
    ? 0
    : (answeredQuestions.value / totalQuestions.value) * 100,
)
</script>

<template>
  <div class="quiz">
    <div v-if="isLoading" class="quiz__loading">
      <span class="quiz__spinner" />
      <span>Cargando tu cuestionario…</span>
    </div>

    <p v-else-if="loadFailed || !currentQuestion" class="quiz__empty">
      No pudimos cargar este cuestionario. Vuelve a intentarlo en un momento.
    </p>

    <template v-else>
      <header class="quiz__header">
        <div class="quiz__heading">
          <span class="quiz__eyebrow">Cuestionarios</span>
          <h1 class="quiz__title">{{ quizStore.quizName }}</h1>
        </div>
        <div class="quiz__meter">
          <span class="quiz__meter-count">
            {{ answeredQuestions }} de {{ totalQuestions }} respondidas
          </span>
          <span class="quiz__bar">
            <span class="quiz__bar-fill" :style="{ width: `${progress}%` }" />
          </span>
        </div>
      </header>

      <section class="quiz__card">
        <div class="quiz__card-head">
          <span class="quiz__step">
            Pregunta {{ questionPosition }}
            <template v-if="currentQuestion.category">
              · {{ currentQuestion.category }}
            </template>
          </span>
          <span class="quiz__step-count">
            {{ questionPosition }} de {{ totalQuestions }}
          </span>
        </div>

        <Question
          :key="currentQuestion.questionId"
          :question="currentQuestion"
          :number="String(questionPosition)"
        />

        <QuizNavigation />
      </section>
    </template>
  </div>
</template>

<style scoped>
.quiz {
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
  background: #f4f8f9;
  min-height: 100vh;
  padding: 24px 24px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.quiz__loading,
.quiz__empty {
  margin: 0;
  padding-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  color: #5c7078;
  line-height: 1.7;
}

.quiz__spinner {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 3px solid #dbf2f4;
  border-top-color: #07979f;
  animation: quiz-spin 0.8s linear infinite;
}

@keyframes quiz-spin {
  to {
    transform: rotate(360deg);
  }
}

.quiz__header,
.quiz__card {
  width: 100%;
  max-width: 880px;
}

.quiz__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.quiz__heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quiz__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5f767e;
}

.quiz__title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.quiz__meter {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex: 0 0 220px;
}

.quiz__meter-count {
  font-size: 13px;
  font-weight: 700;
  color: #065c5d;
}

.quiz__bar {
  width: 220px;
  height: 9px;
  border-radius: 999px;
  background: #e7eff0;
  display: block;
  overflow: hidden;
}

.quiz__bar-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: #07979f;
  transition: width 0.2s ease;
}

.quiz__card {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eaf1f2;
  box-shadow: 0 18px 40px -24px rgba(6, 92, 93, 0.4);
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.quiz__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.quiz__step {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5f767e;
}

.quiz__step-count {
  font-size: 13px;
  font-weight: 700;
  color: #065c5d;
  white-space: nowrap;
}

@media (max-width: 700px) {
  .quiz {
    padding: 18px 14px 32px;
  }

  .quiz__title {
    font-size: 22px;
  }

  .quiz__meter {
    flex: 1 1 100%;
    align-items: stretch;
  }

  .quiz__bar {
    width: 100%;
  }

  .quiz__meter-count {
    text-align: left;
  }

  .quiz__card {
    padding: 22px 18px;
    border-radius: 20px;
  }
}
</style>
