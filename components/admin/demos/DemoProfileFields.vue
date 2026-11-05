<script setup lang="ts">
import type {
  DemoDistribution,
  DemoProfile,
} from '~/interfaces/stats/demo.interface'
import { defaultDemoProfile, validDemoProfile } from '~/utils/helpers/demo'
import { demoDistributions } from '~/utils/translations/demo'
const props = defineProps<{
  modelValue: DemoProfile
  id: string
  disabled?: boolean
}>()
const valid = computed(() => validDemoProfile(props.modelValue))
const emit = defineEmits<{ 'update:modelValue': [value: DemoProfile] }>()
function distribution(event: Event) {
  emit(
    'update:modelValue',
    defaultDemoProfile(
      (event.target as HTMLSelectElement).value as DemoDistribution,
    ),
  )
}
function number(key: 'center' | 'spread' | 'strength', event: Event) {
  const input = event.target as HTMLInputElement
  emit('update:modelValue', { ...props.modelValue, [key]: input.valueAsNumber })
}
</script>
<template>
  <div class="demo-profile-fields">
    <label :for="`${id}-distribution`"
      >Distribución
      <select
        :id="`${id}-distribution`"
        :value="modelValue.distribution"
        :disabled="disabled"
        @change="distribution"
      >
        <option v-for="d in demoDistributions" :key="d.value" :value="d.value">
          {{ d.label }}
        </option>
      </select>
    </label>
    <template v-if="modelValue.distribution === 'normal'">
      <label :for="`${id}-center`"
        >Centro del rango (0 a 1)
        <input
          :id="`${id}-center`"
          :value="modelValue.center"
          type="number"
          min="0"
          max="1"
          step="0.01"
          required
          :disabled="disabled"
          :aria-describedby="`${id}-help`"
          :aria-invalid="!valid"
          @input="number('center', $event)"
        />
      </label>
      <label :for="`${id}-spread`"
        >Dispersión (0.01 a 0.50)
        <input
          :id="`${id}-spread`"
          :value="modelValue.spread"
          type="number"
          min="0.01"
          max="0.5"
          step="0.01"
          required
          :disabled="disabled"
          :aria-describedby="`${id}-help`"
          :aria-invalid="!valid"
          @input="number('spread', $event)"
        />
      </label>
    </template>
    <label
      v-else-if="
        modelValue.distribution === 'low' || modelValue.distribution === 'high'
      "
      :for="`${id}-strength`"
      >Intensidad (1 a 8)
      <input
        :id="`${id}-strength`"
        :value="modelValue.strength"
        type="number"
        min="1"
        max="8"
        step="0.1"
        required
        :disabled="disabled"
        :aria-describedby="`${id}-help`"
        :aria-invalid="!valid"
        @input="number('strength', $event)"
      />
    </label>
    <p v-if="!valid" class="user-error" role="alert">
      Revisa los valores: deben ser números dentro de los rangos indicados.
    </p>
    <p :id="`${id}-help`" class="demo-help">
      <template v-if="modelValue.distribution === 'normal'"
        >0 representa el mínimo del rango y 1 el máximo. La dispersión controla
        qué tan extendidas quedan las respuestas. La distribución se limita a
        ese rango.</template
      >
      <template v-else-if="modelValue.distribution === 'uniform'"
        >Distribuye las respuestas a lo largo del rango puntuable, sin favorecer
        un extremo.</template
      >
      <template v-else
        >1 equivale a una distribución uniforme. Una intensidad mayor concentra
        más respuestas en el extremo elegido.</template
      >
    </p>
  </div>
</template>
