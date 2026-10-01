<script setup lang="ts">
import type { BuilderQuestion } from '~/interfaces/quizzes/quiz-builder.interface'
import { hasOptions } from './quiz-builder-model'

const props = defineProps<{ question: BuilderQuestion; number?: number }>()
const selected = ref<string[]>([])
const answer = ref('')
const instanceId = useId()
const activeOptions = computed(() =>
  hasOptions(props.question.type)
    ? props.question.options.filter((option) =>
        selected.value.includes(option.id),
      )
    : [],
)
const textLimit = computed(() =>
  Math.max(1, Math.min(5000, Number(props.question.maxLength) || 500)),
)
watch(
  () => [props.question.id, props.question.type],
  () => {
    selected.value = []
    answer.value = ''
  },
)
watch(
  () => props.question.options.map((option) => option.id),
  (ids) => {
    selected.value = selected.value.filter((id) => ids.includes(id))
  },
)
watch(
  () => props.question.maxAnswers,
  (limit) => {
    selected.value = selected.value.slice(0, Math.max(1, limit))
  },
)
function selectOption(id: string) {
  if (props.question.type !== 'multiple_choice') {
    selected.value = [id]
    return
  }
  if (selected.value.includes(id))
    selected.value = selected.value.filter((value) => value !== id)
  else if (selected.value.length < props.question.maxAnswers)
    selected.value.push(id)
}
</script>

<template>
  <fieldset class="qb-preview-question">
    <legend>
      {{ number ? `${number}. ` : ''
      }}{{ question.text || 'Aquí aparecerá tu pregunta' }}
      <span v-if="question.required" class="qb-required">*</span>
    </legend>
    <p v-if="question.help" class="qb-muted">{{ question.help }}</p>
    <p class="qb-preview-meta">
      {{ question.required ? 'Obligatoria' : 'Opcional'
      }}<template v-if="question.type === 'multiple_choice'">
        · Elige hasta {{ question.maxAnswers }} opciones</template
      >
    </p>
    <select
      v-if="question.presentation === 'select'"
      :value="selected[0] || ''"
      aria-label="Tu respuesta"
      @change="selected = [($event.target as HTMLSelectElement).value]"
    >
      <option value="">Selecciona una opción</option>
      <option
        v-for="(option, index) in question.options"
        :key="option.id"
        :value="option.id"
      >
        {{ option.text || `Opción ${index + 1}` }}
      </option>
    </select>
    <div
      v-else-if="hasOptions(question.type)"
      class="qb-preview-options"
      :class="{
        'qb-preview-options--scale': question.presentation === 'scale',
      }"
    >
      <label
        v-for="(option, index) in question.options"
        :key="option.id"
        class="qb-preview-option"
        :class="{ 'is-selected': selected.includes(option.id) }"
      >
        <input
          :type="question.type === 'multiple_choice' ? 'checkbox' : 'radio'"
          :name="instanceId"
          :value="option.id"
          :checked="selected.includes(option.id)"
          :disabled="
            question.type === 'multiple_choice' &&
            !selected.includes(option.id) &&
            selected.length >= question.maxAnswers
          "
          @change="selectOption(option.id)"
        />
        <span>{{ option.text || `Opción ${index + 1}` }}</span>
      </label>
    </div>
    <label v-else-if="question.type === 'number'" class="qb-field"
      ><span>Tu respuesta</span
      ><input
        v-model="answer"
        type="number"
        :min="question.min"
        :max="question.max"
        :placeholder="`${question.min} a ${question.max}`"
      /><small>Entre {{ question.min }} y {{ question.max }}.</small
      ><small
        v-if="
          answer !== '' &&
          (Number(answer) < question.min || Number(answer) > question.max)
        "
        class="qb-error"
        >La respuesta está fuera del rango.</small
      ></label
    >
    <label v-else-if="question.type === 'date'" class="qb-field"
      ><span>Tu respuesta</span><input v-model="answer" type="date"
    /></label>
    <label v-else class="qb-field"
      ><span>Tu respuesta</span
      ><textarea
        v-model="answer"
        rows="3"
        :maxlength="textLimit"
        placeholder="Escribe tu respuesta"
      /><small>{{ answer.length }} / {{ textLimit }}</small></label
    >
    <div
      v-for="option in activeOptions"
      :key="option.id"
      class="qb-preview-branch"
    >
      <BuilderQuestionPreview
        v-for="child in option.children"
        :key="child.id"
        :question="child"
      />
    </div>
  </fieldset>
</template>
