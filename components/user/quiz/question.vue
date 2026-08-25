<script setup lang="ts">
import {
  QuestionType,
  isAnswered,
  selectedWeights,
  type IQuizResponse,
} from '~/store/quiz'

const props = withDefaults(
  defineProps<{
    question: IQuizResponse
    /** `sub` is the compact treatment used inside a branch rail. */
    variant?: 'root' | 'sub'
    /** Position label shown before the text, e.g. `9` or `9.1`. */
    number?: string
  }>(),
  { variant: 'root', number: '' },
)

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const TEXT_LIMIT = 500

const isSub = computed(() => props.variant === 'sub')

const isSingleChoice = computed(
  () =>
    props.question.type === QuestionType.MULTIPLE_CHOICE ||
    props.question.type === QuestionType.SINGLE_CHOICE,
)

const hasBranches = computed(() =>
  props.question.options.some(
    (option) => (option.subquestions?.length ?? 0) > 0,
  ),
)

const typeLabel = computed(() => {
  switch (props.question.type) {
    case QuestionType.RATE:
      return 'Escala Likert'
    case QuestionType.CHECKBOX:
      return 'Opción múltiple'
    case QuestionType.DROPDOWN:
      return 'Lista desplegable'
    case QuestionType.NUMBER:
      return 'Numérica'
    case QuestionType.TEXT:
      return 'Texto abierto'
    case QuestionType.DATE:
      return 'Fecha'
    default:
      return 'Selección única'
  }
})

/** The two catalogue types read as a set apart from the scored ones. */
const typeTone = computed(() =>
  props.question.type === QuestionType.CHECKBOX ||
  props.question.type === QuestionType.DROPDOWN
    ? 'muted'
    : 'main',
)

const ruleLabel = computed(() => {
  switch (props.question.type) {
    case QuestionType.CHECKBOX:
      return 'Varias respuestas'
    case QuestionType.DROPDOWN:
      return 'Para catálogos largos'
    case QuestionType.NUMBER:
      return `Rango ${numeric.value.min}–${numeric.value.max}`
    case QuestionType.TEXT:
      return 'Opcional · no se puntúa'
    default:
      return hasBranches.value
        ? '1 respuesta · ramifica'
        : '1 respuesta · obligatoria'
  }
})

const picked = computed(() => selectedWeights(props.question))

function isPicked(weight: number) {
  return picked.value.includes(weight)
}

function letter(index: number) {
  return LETTERS[index] ?? String(index + 1)
}

function subquestionsOf(index: number) {
  return props.question.options[index]?.subquestions ?? []
}

/* --- scale ------------------------------------------------------------- */

// A Likert question with its own options is drawn as labelled segments; without
// them it falls back to the plain 1–5 agreement scale.
const scaleSteps = computed(() => {
  if (props.question.options.length > 0) {
    return props.question.options.map((option) => ({
      label: option.option.text,
      value: option.option.weight,
    }))
  }
  return [1, 2, 3, 4, 5].map((value) => ({ label: String(value), value }))
})

const showScaleEnds = computed(() => props.question.options.length === 0)

/* --- numeric ------------------------------------------------------------ */

const numeric = computed(() => {
  const weights = props.question.options.map((option) => option.option.weight)
  const min = weights.length > 0 ? Math.min(...weights) : 0
  const max = weights.length > 0 ? Math.max(...weights) : 10
  return { min, max: max > min ? max : min + 10, step: 1 }
})

const numericValue = computed(() =>
  isAnswered(props.question) ? Number(props.question.answer) : null,
)

const numericProgress = computed(() => {
  const { min, max } = numeric.value
  if (numericValue.value === null) return 0
  return ((numericValue.value - min) / (max - min)) * 100
})

function stepNumeric(direction: 1 | -1) {
  const { min, max, step } = numeric.value
  if (numericValue.value === null) {
    props.question.answer = min
    return
  }
  const next = numericValue.value + direction * step
  props.question.answer = Math.min(max, Math.max(min, next))
}

/* --- answers ------------------------------------------------------------ */

function pickSingle(weight: number) {
  props.question.answer = weight
}

function toggleOption(weight: number) {
  const current = picked.value
  props.question.answer = current.includes(weight)
    ? current.filter((value) => value !== weight)
    : [...current, weight]
}

const dropdownAnswer = computed({
  get: () => (isAnswered(props.question) ? String(props.question.answer) : ''),
  set: (value: string) => {
    props.question.answer = value === '' ? -1 : Number(value)
  },
})

const textAnswer = computed({
  get: () =>
    typeof props.question.answer === 'string' ? props.question.answer : '',
  set: (value: string) => {
    props.question.answer = value
  },
})

const dateAnswer = computed({
  get: () =>
    typeof props.question.answer === 'string' ? props.question.answer : '',
  set: (value: string) => {
    props.question.answer = value
  },
})
</script>

<template>
  <div class="question" :class="{ 'question--sub': isSub }">
    <div v-if="!isSub" class="question__meta">
      <span class="question__type" :class="`question__type--${typeTone}`">
        {{ typeLabel }}
      </span>
      <span class="question__rule">{{ ruleLabel }}</span>
    </div>

    <p class="question__text">
      <span v-if="isSub && number" class="question__number">{{ number }}</span>
      {{ question.question }}
    </p>

    <!-- Escala Likert -->
    <div v-if="question.type === QuestionType.RATE" class="question__scale">
      <div v-if="showScaleEnds" class="question__scale-ends">
        <span>En desacuerdo</span>
        <span>De acuerdo</span>
      </div>
      <div class="question__scale-row">
        <button
          v-for="step in scaleSteps"
          :key="step.value"
          type="button"
          class="question__scale-btn"
          :class="{ 'question__scale-btn--active': isPicked(step.value) }"
          :aria-pressed="isPicked(step.value)"
          @click="pickSingle(step.value)"
        >
          {{ step.label }}
        </button>
      </div>
    </div>

    <!-- Selección única -->
    <div v-else-if="isSingleChoice" class="question__options">
      <template v-for="(option, index) in question.options" :key="index">
        <label
          class="question__option"
          :class="{
            'question__option--active': isPicked(option.option.weight),
          }"
        >
          <input
            class="question__native"
            type="radio"
            :name="question.questionId"
            :value="option.option.weight"
            :checked="isPicked(option.option.weight)"
            @change="pickSingle(option.option.weight)"
          />
          <span class="question__radio" />
          <span class="question__letter">{{ letter(index) }}</span>
          <span class="question__option-text">{{ option.option.text }}</span>
          <span
            v-if="
              subquestionsOf(index).length && !isPicked(option.option.weight)
            "
            class="question__branch-hint"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 5v6a4 4 0 0 0 4 4h12" />
              <path d="M16 11l4 4-4 4" />
            </svg>
            Abre {{ subquestionsOf(index).length }}
            {{
              subquestionsOf(index).length === 1
                ? 'subpregunta'
                : 'subpreguntas'
            }}
          </span>
        </label>

        <div
          v-if="isPicked(option.option.weight) && subquestionsOf(index).length"
          class="question__branch"
        >
          <span class="question__branch-chip">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 5v6a4 4 0 0 0 4 4h12" />
              <path d="M16 11l4 4-4 4" />
            </svg>
            Porque elegiste {{ letter(index) }}
          </span>
          <Question
            v-for="(subquestion, subIndex) in subquestionsOf(index)"
            :key="subquestion.questionId"
            :question="subquestion"
            variant="sub"
            :number="number ? `${number}.${subIndex + 1}` : ''"
          />
        </div>
      </template>
    </div>

    <!-- Opción múltiple -->
    <div
      v-else-if="question.type === QuestionType.CHECKBOX"
      class="question__checks"
    >
      <div class="question__checks-grid">
        <label
          v-for="(option, index) in question.options"
          :key="index"
          class="question__check"
          :class="{ 'question__check--active': isPicked(option.option.weight) }"
        >
          <input
            class="question__native"
            type="checkbox"
            :checked="isPicked(option.option.weight)"
            @change="toggleOption(option.option.weight)"
          />
          <span class="question__box">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              stroke-width="3.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 13l4 4 10-10" />
            </svg>
          </span>
          {{ option.option.text }}
        </label>
      </div>
      <span class="question__checks-count">
        {{ picked.length }}
        {{ picked.length === 1 ? 'seleccionada' : 'seleccionadas' }}
      </span>
    </div>

    <!-- Lista desplegable -->
    <select
      v-else-if="question.type === QuestionType.DROPDOWN"
      v-model="dropdownAnswer"
      class="question__select"
      :class="{ 'question__select--empty': !isAnswered(question) }"
    >
      <option value="">Selecciona una opción</option>
      <option
        v-for="(option, index) in question.options"
        :key="index"
        :value="String(option.option.weight)"
      >
        {{ option.option.text }}
      </option>
    </select>

    <!-- Numérica -->
    <div
      v-else-if="question.type === QuestionType.NUMBER"
      class="question__number-field"
    >
      <div class="question__stepper">
        <button
          type="button"
          class="question__step"
          aria-label="Restar"
          :disabled="numericValue === null || numericValue <= numeric.min"
          @click="stepNumeric(-1)"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#065c5d"
            stroke-width="3"
            stroke-linecap="round"
          >
            <path d="M5 12h14" />
          </svg>
        </button>
        <div class="question__value">
          <span class="question__value-number">
            {{ numericValue === null ? '—' : numericValue }}
          </span>
        </div>
        <button
          type="button"
          class="question__step"
          aria-label="Sumar"
          :disabled="numericValue !== null && numericValue >= numeric.max"
          @click="stepNumeric(1)"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#065c5d"
            stroke-width="3"
            stroke-linecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
      <div class="question__range">
        <span class="question__range-track">
          <span
            class="question__range-fill"
            :style="{ width: `${numericProgress}%` }"
          />
        </span>
        <div class="question__range-ends">
          <span>{{ numeric.min }}</span>
          <span>{{ numeric.max }}</span>
        </div>
      </div>
    </div>

    <!-- Texto abierto -->
    <div
      v-else-if="question.type === QuestionType.TEXT"
      class="question__text-field"
    >
      <textarea
        v-model="textAnswer"
        class="question__textarea"
        :maxlength="TEXT_LIMIT"
        placeholder="Escribe con tus palabras. Solo lo lee un especialista, nunca tu institución."
      />
      <span class="question__counter"
        >{{ textAnswer.length }} / {{ TEXT_LIMIT }}</span
      >
      <span class="question__note">
        <span class="question__note-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#065c5d"
            stroke-width="2.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 3l8 3v6c0 5-3.5 8.2-8 9-4.5-.8-8-4-8-9V6z" />
          </svg>
        </span>
        Las respuestas de texto quedan fuera de los reportes agregados.
      </span>
    </div>

    <!-- Fecha -->
    <input
      v-else-if="question.type === QuestionType.DATE"
      v-model="dateAnswer"
      class="question__select"
      :class="{ 'question__select--empty': !isAnswered(question) }"
      type="date"
    />
  </div>
</template>

<style scoped>
.question {
  font-family: 'Figtree', sans-serif;
  color: #0e2a36;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question--sub {
  gap: 12px;
}

.question__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.question__type {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.question__type--main {
  background: #dbf2f4;
  color: #065c5d;
}

.question__type--muted {
  background: #f0eaf5;
  color: #5c4a75;
}

.question__rule {
  font-size: 12px;
  font-weight: 600;
  color: #5f767e;
}

.question__text {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: -0.015em;
  text-wrap: pretty;
}

.question--sub .question__text {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0;
}

.question__number {
  margin-right: 6px;
  color: #07979f;
}

/* --- scale --------------------------------------------------------------- */

.question__scale {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question__scale-ends {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 700;
  color: #4b5f68;
}

.question__scale-row {
  display: flex;
  gap: 10px;
}

.question__scale-btn {
  flex: 1;
  min-width: 0;
  height: 56px;
  padding: 0 8px;
  border-radius: 18px;
  border: 2px solid #e3ecee;
  background: #fff;
  font-family: 'Figtree', sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #4b5f68;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease;
}

.question--sub .question__scale-btn {
  height: 50px;
  border-radius: 16px;
  font-size: 15px;
}

.question__scale-btn:hover {
  border-color: #6cc5cb;
}

.question__scale-btn--active,
.question__scale-btn--active:hover {
  border-color: #07979f;
  background: #07979f;
  color: #fff;
  font-weight: 800;
}

/* --- options ------------------------------------------------------------- */

.question__options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question__native {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.question__option {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 56px;
  padding: 12px 20px;
  border-radius: 18px;
  border: 2px solid #e3ecee;
  background: #fff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.question__option:hover {
  border-color: #6cc5cb;
}

.question__option--active,
.question__option--active:hover {
  border-color: #07979f;
  background: #f0fafa;
  font-weight: 700;
}

.question__option:focus-within {
  border-color: #07979f;
  box-shadow: 0 0 0 4px rgba(7, 151, 159, 0.14);
}

.question__radio {
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  border-radius: 999px;
  border: 2px solid #cfdde1;
  transition: border 0.15s ease;
}

.question__option--active .question__radio {
  border: 6px solid #07979f;
}

.question__letter {
  flex: 0 0 18px;
  font-weight: 800;
  color: #5f767e;
}

.question__option--active .question__letter {
  color: #07979f;
}

.question__option-text {
  flex: 1;
  min-width: 0;
}

.question__branch-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #065c5d;
  white-space: nowrap;
}

.question__branch-hint svg {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
}

.question__branch {
  margin-left: 26px;
  padding: 6px 0 6px 24px;
  border-left: 3px solid #6cc5cb;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.question__branch-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  background: #dbf2f4;
  color: #065c5d;
  font-size: 11px;
  font-weight: 700;
}

.question__branch-chip svg {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
}

/* --- checkboxes ---------------------------------------------------------- */

.question__checks {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question__checks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.question__check {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding: 10px 16px;
  border-radius: 18px;
  border: 2px solid #e3ecee;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.question--sub .question__check {
  min-height: 48px;
  border-radius: 16px;
}

.question__check:hover {
  border-color: #6cc5cb;
}

.question__check--active,
.question__check--active:hover {
  border-color: #07979f;
  background: #f0fafa;
  font-weight: 700;
}

.question__check:focus-within {
  border-color: #07979f;
  box-shadow: 0 0 0 4px rgba(7, 151, 159, 0.14);
}

.question__box {
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  border-radius: 7px;
  border: 2px solid #cfdde1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.question__box svg {
  width: 14px;
  height: 14px;
  opacity: 0;
}

.question__check--active .question__box {
  border-color: #07979f;
  background: #07979f;
}

.question__check--active .question__box svg {
  opacity: 1;
}

.question__checks-count {
  font-size: 13px;
  color: #4b5f68;
}

/* --- select / date ------------------------------------------------------- */

.question__select {
  width: 100%;
  height: 56px;
  border-radius: 999px;
  border: 2px solid #07979f;
  background: #fff;
  padding: 0 22px;
  font-family: 'Figtree', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #0e2a36;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2307979f' stroke-width='2.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 20px center;
  background-size: 20px 20px;
}

.question__select--empty {
  border-color: #e3ecee;
  font-weight: 600;
  color: #8a9ba1;
}

.question__select[type='date'] {
  appearance: auto;
  background-image: none;
  cursor: text;
}

/* --- numeric ------------------------------------------------------------- */

.question__number-field {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question__stepper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.question__step {
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  border-radius: 999px;
  border: 2px solid #e3ecee;
  background: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s ease;
}

.question__step svg {
  width: 20px;
  height: 20px;
}

.question__step:hover:not(:disabled) {
  border-color: #07979f;
}

.question__step:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.question__value {
  flex: 1;
  height: 56px;
  border-radius: 18px;
  background: #f6fcfc;
  border: 2px solid #dbf2f4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question__value-number {
  font-size: 26px;
  font-weight: 800;
}

.question__range {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question__range-track {
  height: 8px;
  border-radius: 999px;
  background: #e3ecee;
  display: block;
  overflow: hidden;
}

.question__range-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: #07979f;
  transition: width 0.15s ease;
}

.question__range-ends {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: #4b5f68;
}

/* --- text ---------------------------------------------------------------- */

.question__text-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question__textarea {
  border-radius: 20px;
  border: 2px solid #dbf2f4;
  background: #f6fcfc;
  padding: 18px 20px;
  min-height: 150px;
  resize: vertical;
  font-family: 'Figtree', sans-serif;
  font-size: 15px;
  line-height: 1.6;
  color: #0e2a36;
  outline: none;
}

.question__textarea::placeholder {
  color: #5f767e;
}

.question__textarea:focus {
  border-color: #07979f;
  background: #fff;
}

.question__counter {
  align-self: flex-end;
  font-size: 12px;
  font-weight: 600;
  color: #5f767e;
}

.question__note {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  line-height: 1.5;
  color: #4b5f68;
}

.question__note-icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 999px;
  background: #dbf2f4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.question__note-icon svg {
  width: 17px;
  height: 17px;
}

@media (max-width: 700px) {
  .question__text {
    font-size: 20px;
  }

  .question__scale-row {
    gap: 8px;
  }

  .question__scale-btn {
    height: 50px;
    font-size: 15px;
  }

  .question__branch {
    margin-left: 8px;
    padding-left: 16px;
  }

  .question__branch-hint {
    display: none;
  }
}
</style>
