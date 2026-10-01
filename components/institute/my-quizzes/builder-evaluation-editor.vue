<script setup lang="ts">
import type {
  BuilderQuestion,
  EvaluationConfiguration,
  RiskLevel,
} from '~/interfaces/quizzes/quiz-builder.interface'
import BuilderDimensionEditor from './builder-dimension-editor.vue'
import { createDimension } from './quiz-builder-model'
const evaluation = defineModel<EvaluationConfiguration>({ required: true })
defineProps<{ questions: BuilderQuestion[] }>()
const risks: { value: RiskLevel; label: string }[] = [
  { value: 'low', label: 'Bajo' },
  { value: 'moderate', label: 'Moderado' },
  { value: 'high', label: 'Alto' },
]
function addDimension() {
  const dimension = createDimension()
  dimension.interpretations = [
    { risk: 'low', label: 'Bajo', min: 0 },
    { risk: 'moderate', label: 'Moderado', min: '' },
    { risk: 'high', label: 'Alto', min: '' },
  ]
  evaluation.value.dimensions.push(dimension)
  evaluation.value.alarms.push({
    dimensionId: dimension._id,
    enabled: true,
    risks: ['moderate', 'high'],
  })
}
function removeDimension(id: string) {
  evaluation.value.dimensions = evaluation.value.dimensions.filter(
    (d) => d._id !== id,
  )
  evaluation.value.alarms = evaluation.value.alarms.filter(
    (a) => a.dimensionId !== id,
  )
}
</script>
<template>
  <section class="qb-panel" aria-labelledby="qb-evaluation-title">
    <div class="qb-row">
      <div class="qb-section-heading">
        <h2 id="qb-evaluation-title">Configuración de la evaluación</h2>
        <p>Define una calificación independiente por sustancia o dimensión.</p>
      </div>
      <button type="button" class="qb-button" @click="addDimension">
        + Añadir sustancia o dimensión
      </button>
    </div>
    <p v-if="!evaluation.dimensions.length" class="qb-muted">
      Sin dimensiones configuradas. Puedes guardar un cuestionario solo
      informativo.
    </p>
    <section
      v-for="(dimension, index) in evaluation.dimensions"
      :key="dimension._id"
      class="qb-dimension"
    >
      <div class="qb-row">
        <h3>{{ dimension.label || `Dimensión ${index + 1}` }}</h3>
        <button
          type="button"
          class="qb-button qb-danger"
          :aria-label="`Eliminar ${dimension.label || 'dimensión ' + (index + 1)}`"
          @click="removeDimension(dimension._id)"
        >
          Eliminar dimensión
        </button>
      </div>
      <BuilderDimensionEditor
        v-model="evaluation.dimensions[index]"
        :questions="questions"
      />
      <fieldset
        v-for="alarm in evaluation.alarms.filter(
          (item) => item.dimensionId === dimension._id,
        )"
        :key="alarm.dimensionId"
        class="qb-evaluation-group"
      >
        <legend>Alarma de esta sustancia o dimensión</legend>
        <label class="qb-check"
          ><input v-model="alarm.enabled" type="checkbox" /><span
            >Habilitar alarma</span
          ></label
        >
        <div v-if="alarm.enabled" class="qb-actions">
          <label v-for="risk in risks" :key="risk.value" class="qb-check"
            ><input
              v-model="alarm.risks"
              type="checkbox"
              :value="risk.value"
            /><span>{{ risk.label }}</span></label
          >
        </div>
      </fieldset>
    </section>
    <label class="qb-field"
      ><span>Etiqueta de alarma final</span
      ><input v-model="evaluation.alarmLabel" maxlength="100"
    /></label>
    <p class="qb-muted">
      La alarma final se activará si alguna sustancia alcanza uno de sus niveles
      seleccionados. Por defecto: moderado o alto. Un resultado incompleto no
      debe interpretarse como ausencia de riesgo.
    </p>
    <label class="qb-check"
      ><input
        type="checkbox"
        :checked="!!evaluation.overall"
        @change="
          evaluation.overall = ($event.target as HTMLInputElement).checked
            ? createDimension('Calificación global')
            : null
        "
      /><span
        >Añadir una calificación global independiente (opcional)</span
      ></label
    >
    <BuilderDimensionEditor
      v-if="evaluation.overall"
      v-model="evaluation.overall"
      :questions="questions"
    />
  </section>
</template>
