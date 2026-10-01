<script setup lang="ts">
import type {
  BuilderQuestion,
  EvaluationDimension,
} from '~/interfaces/quizzes/quiz-builder.interface'
const dimension = defineModel<EvaluationDimension>({ required: true })
const props = defineProps<{ questions: BuilderQuestion[] }>()
const missingItems = computed(() =>
  dimension.value.items.filter(
    (item) => !props.questions.some((q) => q.id === item.questionId),
  ),
)
function toggleQuestion(id: string, checked: boolean) {
  if (checked) dimension.value.items.push({ questionId: id, weight: 1 })
  else
    dimension.value.items = dimension.value.items.filter(
      (item) => item.questionId !== id,
    )
}
function toggleInterpretations(enabled: boolean) {
  dimension.value.interpretations = enabled
    ? [
        { risk: 'low', label: 'Bajo', min: 0 },
        { risk: 'moderate', label: 'Moderado', min: '' },
        { risk: 'high', label: 'Alto', min: '' },
      ]
    : []
}
</script>
<template>
  <div class="qb-dimension-fields">
    <div class="qb-fields">
      <label class="qb-field"
        ><span>Nombre</span
        ><input
          v-model="dimension.label"
          maxlength="100"
          placeholder="Ej. Alcohol"
      /></label>
      <label class="qb-field"
        ><span>Cálculo</span
        ><select v-model="dimension.method">
          <option value="sum">Suma</option>
          <option value="mean">Promedio</option>
          <option value="weighted_mean">Promedio ponderado</option>
        </select></label
      >
    </div>
    <fieldset class="qb-evaluation-group">
      <legend>Preguntas que aportan a esta calificación</legend>
      <p v-if="!questions.length" class="qb-muted">
        Configura al menos una pregunta con «Aporta a la calificación» para
        seleccionarla aquí.
      </p>
      <div
        v-for="question in questions"
        :key="question.id"
        class="qb-evaluation-item"
      >
        <label class="qb-check"
          ><input
            type="checkbox"
            :checked="
              dimension.items.some((item) => item.questionId === question.id)
            "
            @change="
              toggleQuestion(
                question.id,
                ($event.target as HTMLInputElement).checked,
              )
            "
          /><span>{{ question.text || 'Pregunta sin enunciado' }}</span></label
        >
        <template v-if="dimension.method === 'weighted_mean'">
          <label
            v-for="item in dimension.items.filter(
              (item) => item.questionId === question.id,
            )"
            :key="item.questionId"
            class="qb-field qb-score"
            ><span>Peso</span
            ><input
              v-model.number="item.weight"
              type="number"
              min="0.000001"
              step="any"
              :aria-label="`Peso de ${question.text}`"
          /></label>
        </template>
      </div>
      <div
        v-for="item in missingItems"
        :key="item.questionId"
        class="qb-row qb-error"
      >
        <span>Una pregunta seleccionada se eliminó o ya no puntúa.</span>
        <button
          type="button"
          class="qb-button"
          @click="toggleQuestion(item.questionId, false)"
        >
          Quitar referencia
        </button>
      </div>
    </fieldset>
    <div class="qb-fields">
      <label class="qb-field"
        ><span>Si falta una respuesta visible</span
        ><select v-model="dimension.missingAnswers">
          <option value="invalidate">No emitir calificación</option>
          <option value="exclude">Excluir del cálculo</option>
        </select></label
      >
      <label class="qb-field"
        ><span>Preguntas ocultas por una condición</span
        ><select v-model="dimension.skippedQuestions">
          <option value="exclude">Excluir del cálculo</option>
          <option value="zero">Aportar cero al cálculo</option>
        </select></label
      >
      <label class="qb-field"
        ><span>Cobertura mínima (%)</span
        ><input
          v-model.number="dimension.minimumAnsweredPercentage"
          type="number"
          min="0"
          max="100"
          step="any"
      /></label>
    </div>
    <p class="qb-muted">
      La cobertura se mide sobre las preguntas visibles. Una respuesta sin
      puntuación no cuenta como dato evaluable. Aportar cero por una condición
      no crea una respuesta del alumno.
    </p>
    <label class="qb-check"
      ><input
        type="checkbox"
        :checked="dimension.interpretations.length > 0"
        @change="
          toggleInterpretations(($event.target as HTMLInputElement).checked)
        "
      /><span>Interpretar la calificación por nivel de riesgo</span></label
    >
    <div v-if="dimension.interpretations.length" class="qb-fields">
      <label
        v-for="(band, index) in dimension.interpretations"
        :key="band.risk"
        class="qb-field"
      >
        <span>{{ band.label }} · desde (incluido)</span
        ><input
          v-model.number="band.min"
          type="number"
          min="0"
          step="any"
          :disabled="index === 0"
        />
        <small v-if="index < 2">Hasta antes del siguiente nivel.</small
        ><small v-else>Sin límite superior.</small>
      </label>
    </div>
    <p v-if="dimension.interpretations.length" class="qb-muted">
      Define los límites del instrumento que estás configurando; no se asignan
      umbrales clínicos automáticamente.
    </p>
  </div>
</template>
