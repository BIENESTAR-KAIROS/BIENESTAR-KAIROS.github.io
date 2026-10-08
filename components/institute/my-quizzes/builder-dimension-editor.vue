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
function addInterpretation() {
  dimension.value.interpretations.push({ risk: null, label: '', min: '' })
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
    <div class="qb-fields">
      <label class="qb-field"
        ><span>Grupo (opcional)</span>
        <input
          v-model="dimension.group"
          maxlength="100"
          placeholder="Ej. Bienestar Emocional"
        />
      </label>
      <label class="qb-field"
        ><span>Multiplicar resultado por</span>
        <input
          :value="dimension.scoreMultiplier ?? 1"
          type="number"
          min="0.000001"
          step="any"
          @input="
            dimension.scoreMultiplier = (
              $event.target as HTMLInputElement
            ).valueAsNumber
          "
        />
        <small
          >Usa 1 para conservar el resultado o 20 para convertir un promedio de
          1–5 a porcentaje de 20–100.</small
        >
      </label>
      <label class="qb-field"
        ><span>Unidad (opcional)</span>
        <input v-model="dimension.unit" maxlength="20" placeholder="Ej. %" />
      </label>
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
      puntuación no cuenta como dato evaluable. Las preguntas ocultas y sus
      respuestas quedan excluidas de la calificación y de la cobertura.
    </p>
    <label class="qb-check"
      ><input
        type="checkbox"
        :checked="dimension.interpretations.length > 0"
        @change="
          toggleInterpretations(($event.target as HTMLInputElement).checked)
        "
      /><span>Interpretar la calificación por niveles</span></label
    >
    <div v-if="dimension.interpretations.length" class="qb-dimension-fields">
      <section
        v-for="(band, index) in dimension.interpretations"
        :key="index"
        class="qb-dimension"
      >
        <div class="qb-row">
          <h3>Nivel {{ index + 1 }}</h3>
          <button
            type="button"
            class="qb-button qb-danger"
            :aria-label="`Eliminar nivel ${index + 1}`"
            @click="dimension.interpretations.splice(index, 1)"
          >
            Eliminar nivel
          </button>
        </div>
        <div class="qb-fields">
          <label class="qb-field"
            ><span>Nombre del nivel</span
            ><input v-model="band.label" maxlength="100"
          /></label>
          <label class="qb-field"
            ><span>Clave (opcional)</span
            ><input v-model="band.key" maxlength="100"
          /></label>
          <label class="qb-field"
            ><span>Riesgo asociado</span>
            <select v-model="band.risk">
              <option :value="null">Sin riesgo asociado</option>
              <option value="low">Bajo</option>
              <option value="moderate">Moderado</option>
              <option value="high">Alto</option>
            </select>
            <small>Solo se usa si quieres activar alarmas por riesgo.</small>
          </label>
          <label class="qb-field"
            ><span>Desde (incluido)</span>
            <input v-model.number="band.min" type="number" min="0" step="any" />
          </label>
          <label class="qb-field"
            ><span>Hasta (incluido, opcional)</span>
            <input v-model.number="band.max" type="number" min="0" step="any" />
            <small
              >Vacío: hasta antes del siguiente nivel; el último queda sin
              límite superior.</small
            >
          </label>
        </div>
        <label class="qb-field"
          ><span>Recomendaciones de este nivel (opcional)</span>
          <textarea v-model="band.recommendations" rows="3" maxlength="2000" />
        </label>
      </section>
      <button
        type="button"
        class="qb-button qb-button--dashed"
        :disabled="dimension.interpretations.length >= 20"
        @click="addInterpretation"
      >
        + Añadir nivel
      </button>
      <p class="qb-muted">
        Los límites se aplican al resultado después de multiplicarlo. Los
        valores entre rangos separados quedan sin interpretación; no se
        redondean para asignarles un nivel. Configura los límites que indique tu
        instrumento.
      </p>
    </div>
  </div>
</template>
