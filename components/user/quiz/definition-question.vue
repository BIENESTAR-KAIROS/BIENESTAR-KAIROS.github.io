<script setup lang="ts">
import type {
  StudentAnswer,
  StudentDefinitionQuestion,
} from '~/interfaces/quizzes/student-questionnaire.interface'

const props = defineProps<{
  question: StudentDefinitionQuestion
  answer?: StudentAnswer
  error?: string | null
}>()
const emit = defineEmits<{ answer: [value: StudentAnswer] }>()
const inputId = useId()
const selected = computed(() =>
  Array.isArray(props.answer) ? props.answer : [props.answer],
)
const scalar = computed(() =>
  Array.isArray(props.answer) ? '' : (props.answer ?? ''),
)
const isChoice = computed(() =>
  ['single_choice', 'multiple_choice'].includes(props.question.type),
)
function atLimit(id: string) {
  return (
    props.question.type === 'multiple_choice' &&
    !selected.value.includes(id) &&
    Array.isArray(props.answer) &&
    props.answer.length >=
      (props.question.constraints.maxSelections ?? Infinity)
  )
}
function choose(id: string) {
  if (props.question.type === 'single_choice') {
    emit('answer', id)
    return
  }
  const current = Array.isArray(props.answer) ? props.answer : []
  if (current.includes(id))
    emit(
      'answer',
      current.filter((value) => value !== id),
    )
  else if (!atLimit(id)) emit('answer', [...current, id])
}
function enterNumber(event: Event) {
  const input = event.target as HTMLInputElement
  emit('answer', input.value === '' ? '' : input.valueAsNumber)
}
</script>

<template>
  <fieldset
    class="definition-question"
    :aria-describedby="`${inputId}-help ${inputId}-error`"
  >
    <legend>{{ question.text }}</legend>
    <div :id="`${inputId}-help`" class="definition-question__help">
      <p v-if="question.helpText">{{ question.helpText }}</p>
      <p>
        {{ question.required ? 'Obligatoria' : 'Opcional' }}
        <template v-if="question.type === 'multiple_choice'">
          ·
          {{
            question.constraints.maxSelections
              ? `Elige hasta ${question.constraints.maxSelections} opciones`
              : 'Puedes elegir varias opciones'
          }}
        </template>
      </p>
    </div>

    <select
      v-if="isChoice && question.presentation === 'select'"
      :id="inputId"
      :value="scalar"
      aria-label="Tu respuesta"
      :aria-required="question.required"
      :aria-invalid="Boolean(error)"
      :aria-describedby="`${inputId}-help ${inputId}-error`"
      @change="emit('answer', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">Selecciona una opción</option>
      <option
        v-for="option in question.options"
        :key="option._id"
        :value="option._id"
      >
        {{ option.text }}
      </option>
    </select>

    <div
      v-else-if="isChoice"
      class="definition-question__options"
      :class="{
        'definition-question__options--scale':
          question.presentation === 'scale',
      }"
    >
      <label
        v-for="option in question.options"
        :key="option._id"
        class="definition-question__option"
        :class="{
          'is-selected': selected.includes(option._id),
          'is-disabled': atLimit(option._id),
        }"
      >
        <input
          :type="question.type === 'multiple_choice' ? 'checkbox' : 'radio'"
          :name="inputId"
          :value="option._id"
          :checked="selected.includes(option._id)"
          :disabled="atLimit(option._id)"
          :aria-invalid="Boolean(error)"
          :aria-describedby="`${inputId}-help ${inputId}-error`"
          @change="choose(option._id)"
        />
        <span>{{ option.text }}</span>
      </label>
    </div>

    <div v-else class="definition-question__field">
      <label :for="inputId">Tu respuesta</label>
      <textarea
        v-if="question.type === 'text'"
        :id="inputId"
        :value="scalar"
        rows="4"
        :maxlength="question.constraints.maxLength"
        :aria-required="question.required"
        :aria-invalid="Boolean(error)"
        :aria-describedby="`${inputId}-help ${inputId}-error`"
        @input="emit('answer', ($event.target as HTMLTextAreaElement).value)"
      />
      <input
        v-else-if="question.type === 'number'"
        :id="inputId"
        type="number"
        step="any"
        :value="scalar"
        :min="question.constraints.min"
        :max="question.constraints.max"
        :aria-required="question.required"
        :aria-invalid="Boolean(error)"
        :aria-describedby="`${inputId}-help ${inputId}-error`"
        @input="enterNumber"
      />
      <input
        v-else-if="question.type === 'date'"
        :id="inputId"
        type="date"
        :value="scalar"
        :aria-required="question.required"
        :aria-invalid="Boolean(error)"
        :aria-describedby="`${inputId}-help ${inputId}-error`"
        @input="emit('answer', ($event.target as HTMLInputElement).value)"
      />
      <small v-if="question.type === 'text' && question.constraints.maxLength">
        {{ String(scalar).length }} / {{ question.constraints.maxLength }}
      </small>
      <small v-if="question.type === 'number'">
        <template v-if="question.constraints.min !== undefined">
          Mínimo: {{ question.constraints.min }}.
        </template>
        <template v-if="question.constraints.max !== undefined">
          Máximo: {{ question.constraints.max }}.
        </template>
      </small>
    </div>
    <p :id="`${inputId}-error`" class="definition-question__error" role="alert">
      {{ error }}
    </p>
    <button
      v-if="answer !== undefined"
      type="button"
      class="definition-question__clear"
      @click="emit('answer', '')"
    >
      Borrar respuesta
    </button>
  </fieldset>
</template>

<style scoped>
.definition-question {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}
legend {
  padding: 0;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.35;
  overflow-wrap: anywhere;
}
.definition-question__help {
  margin: 16px 0;
  color: #4b5f68;
  font-size: 14px;
  line-height: 1.6;
}
.definition-question__help p + p {
  margin-top: 8px;
}
.definition-question__options,
.definition-question__field {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.definition-question__options--scale {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(140px, 100%), 1fr));
}
.definition-question__option {
  min-height: 56px;
  padding: 14px 16px;
  border: 2px solid #cfdde1;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  overflow-wrap: anywhere;
}
.definition-question__option.is-selected {
  border-color: #07979f;
  background: #f0fafa;
}
.definition-question__option.is-disabled {
  background: #f4f8f9;
  color: #4b5f68;
  cursor: not-allowed;
}
.definition-question__option input {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  accent-color: #065c5d;
}
select,
textarea,
.definition-question__field input {
  width: 100%;
  min-width: 0;
  min-height: 56px;
  border: 2px solid #cfdde1;
  border-radius: 16px;
  padding: 14px;
  background: #fff;
  color: #0e2a36;
  font: inherit;
}
textarea {
  resize: vertical;
}
.definition-question__clear {
  min-height: 44px;
  margin-top: 8px;
  color: #065c5d;
  font: inherit;
  text-decoration: underline;
}
:is(input, select, textarea, button):focus-visible,
.definition-question__option:focus-within {
  outline: 3px solid #07979f;
  outline-offset: 3px;
}
.definition-question__error {
  color: #8a1c1c;
  font-size: 14px;
  margin-top: 12px;
}
.definition-question__error:empty {
  display: none;
}
@media (max-width: 700px) {
  legend {
    font-size: 20px;
  }
}
</style>
